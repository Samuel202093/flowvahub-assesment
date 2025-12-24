import { supabase } from './supabase'
import type { PointsStatus } from '../types'

// Helper: returns yyyy-mm-dd for today in UTC (Supabase uses ISO dates)
const todayDate = (): string => {
  const d = new Date()
  // use local date but store as ISO date string without time
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export async function ensureUserPointsRow(userId: string): Promise<void> {
  // Ensure a base row exists without overwriting existing points
  const { data, error } = await supabase
    .from('user_points')
    .select('user_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!data) {
    const { error: insertErr } = await supabase
      .from('user_points')
      .insert({ user_id: userId, points: 0 })
    if (insertErr) throw insertErr
  }
}

export async function fetchPointsStatus(userId: string): Promise<PointsStatus> {
  await ensureUserPointsRow(userId)

  const [{ data: pointsRow, error: pointsErr }, { data: claims, error: claimsErr }] = await Promise.all([
    supabase.from('user_points').select('points').eq('user_id', userId).single(),
    supabase
      .from('point_claims')
      .select('claimed_on')
      .eq('user_id', userId)
      .order('claimed_on', { ascending: false })
  ])

  if (pointsErr) throw pointsErr
  if (claimsErr) throw claimsErr

  const today = todayDate()
  const hasClaimedToday = !!claims?.find(c => c.claimed_on === today)

  // Compute simple streak: consecutive days including today (or last claim)
  let streak = 0
  if (claims && claims.length > 0) {
    let cursor = today
    // If not claimed today, start from yesterday
    const base = new Date(cursor)
    if (!hasClaimedToday) base.setDate(base.getDate() - 1)
    cursor = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`

    const set = new Set(claims.map(c => c.claimed_on as string))
    // Walk backwards while consecutive dates exist
    while (set.has(cursor)) {
      streak += 1
      const d = new Date(cursor)
      d.setDate(d.getDate() - 1)
      cursor = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
  }

  // Reconcile points from claim history if needed (5 pts per claim)
  const claimedCount = claims?.length ?? 0
  const expectedPoints = claimedCount * 5
  let finalPoints = pointsRow?.points ?? 0
  if (expectedPoints > finalPoints) {
    const { error: reconcileErr } = await supabase
      .from('user_points')
      .update({ points: expectedPoints })
      .eq('user_id', userId)
    if (!reconcileErr) {
      finalPoints = expectedPoints
    }
  }

  return {
    points: finalPoints,
    hasClaimedToday,
    streakDays: streak
  }
}

export async function claimToday(userId: string, pointsPerClaim = 5): Promise<PointsStatus> {
  const today = todayDate()
  // Guard: check existing claim
  const { data: existing, error: existingErr } = await supabase
    .from('point_claims')
    .select('id, claimed_on')
    .eq('user_id', userId)
    .eq('claimed_on', today)
    .limit(1)
    .maybeSingle()

  if (existingErr) throw existingErr
  if (existing) {
    // Already claimed; just return current status
    return await fetchPointsStatus(userId)
  }

  // Insert claim
  const { error: insertErr } = await supabase
    .from('point_claims')
    .insert({ user_id: userId, claimed_on: today })
  if (insertErr) {
    // Provide clearer message for RLS policy violation
    if ((insertErr as any).code === '42501') {
      throw new Error('Not authorized to insert claim: configure RLS policies for point_claims.')
    }
    throw insertErr
  }

  // Upsert points row then increment
  await ensureUserPointsRow(userId)
  // Manual increment approach
  const { data: row, error: getErr } = await supabase.from('user_points').select('points').eq('user_id', userId).single()
  if (getErr) throw getErr
  const newPoints = (row?.points ?? 0) + pointsPerClaim
  const { error: setErr } = await supabase.from('user_points').update({ points: newPoints }).eq('user_id', userId)
  if (setErr) throw setErr

  return await fetchPointsStatus(userId)
}
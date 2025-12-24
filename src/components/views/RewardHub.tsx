import React, { useEffect, useState } from 'react'
import {
  FiMenu,
  FiCalendar,
  FiZap,
  FiUserPlus,
  FiGift,
  FiShare2,
  FiLink,
  FiStar,
  FiCopy,
  FiCheck,
  FiCreditCard,
  FiDollarSign,
} from 'react-icons/fi'
import { FiCheckCircle } from "react-icons/fi";
import { FaAward, FaXTwitter, FaBell } from "react-icons/fa6";
import { FaFacebookF, FaLinkedinIn, FaWhatsapp, FaStar } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { RiMedalFill } from "react-icons/ri";
import { fetchPointsStatus } from '../../lib/points'
import type { PointsStatus } from '../../types'

const TabButton: React.FC<{ label: string; active?: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200
      ${active ? 'bg-violet-100 text-violet-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
  >
    {label}
  </button>
)

const DayChip: React.FC<{ label: string; active?: boolean; highlight?: boolean; claimed?: boolean }> = ({ label, active, highlight, claimed }) => (
  <div
    className={`h-9 w-9 rounded-full flex items-center justify-center text-sm
      ${claimed ? 'bg-[#70d6ff] text-white' : (active ? 'bg-violet-100 text-violet-800' : 'bg-slate-100 text-slate-600')}
      ${highlight && !claimed ? 'ring-2 ring-violet-500' : ''}`}
  >
    {label}
  </div>
)

const RewardHub: React.FC<{ onOpenNav?: () => void }> = ({ onOpenNav }) => {
  const [tab, setTab] = useState<'earn' | 'redeem'>('earn')
  const [copied, setCopied] = useState(false)
  const makeReferralLink = (fullName?: string, userId?: string) => {
    const safeName = (fullName || 'User').trim().replace(/\s+/g, '-')
    // Stable 4-digit code derived from userId; falls back to random
    const base = userId
      ? Array.from(userId).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
      : Math.floor(1000 + Math.random() * 9000)
    const code = (base % 9000) + 1000
    return `https://flowvahub.com/signup?ref=${encodeURIComponent(`${safeName}${code}`)}`
  }
  const { user } = useAuth()
  const referralLink = makeReferralLink(user?.name || undefined, user?.id || undefined)
  const [status, setStatus] = useState<PointsStatus | null>(null)
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true)
  const [errorStatus, setErrorStatus] = useState<string | null>(null)
  const [claiming, setClaiming] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)

  useEffect(() => {
    const run = async () => {
      if (!user) return
      setLoadingStatus(true)
      setErrorStatus(null)
      try {
        const s = await fetchPointsStatus(user.id)
        setStatus(s)
      } catch (e: any) {
        setErrorStatus(e?.message || 'Failed to load points')
      } finally {
        setLoadingStatus(false)
      }
    }
    run()
  }, [user])

  const handleClaimToday = async () => {
    if (!user || status?.hasClaimedToday) return
    setClaiming(true)
    setErrorStatus(null)
    try {
      // Optimistic UI update: reflect +5 immediately
      setStatus(prev => prev ? { ...prev, points: (prev.points ?? 0) + 5, hasClaimedToday: true } : prev)
     
      // Ensure UI reflects server state after claim
      const latest = await fetchPointsStatus(user.id)
      setStatus(latest)
      setShowModal(true)
    } catch (e: any) {
      // Reconcile by refetching if optimistic update was wrong
      try {
        if (user) {
          const latest = await fetchPointsStatus(user.id)
          setStatus(latest)
        }
      } catch {}
      setErrorStatus(e?.message || 'Failed to claim today\'s point')
    } finally {
      setClaiming(false)
    }
  }

  const currentDayIndex = ((new Date().getDay() + 6) % 7) 

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      
    }
  }

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/90y bg-[#f9fafb] backdrop-blur border-b border-slate-200">
        <div className="flex items-center justify-between px-3 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => onOpenNav?.()}
              className="lg:hidden h-9 w-9 flex items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <FiMenu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Rewards Hub</h1>
              <p className="text-sm text-slate-600">Earn points, unlock rewards, and celebrate your progress!</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Notifications"
            className="h-9 w-9 flex items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <FaBell className="h-5 w-5" />
          </button>
        </div>
        <div className="px-3 sm:px-6">
          <div className="flex gap-2 cursor-pointer">
            <TabButton  label="Earn Points" active={tab === 'earn'} onClick={() => setTab('earn')}/>
            <TabButton  label="Redeem Rewards" active={tab === 'redeem'} onClick={() => setTab('redeem')} />
          </div>
        </div>
      </div>

      {/* Content */}
      {tab === 'earn' && (
        <>
      <div className="w-full px-3 sm:px-6 max-w-full md:max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-6 w-1 rounded bg-violet-600" />
          <h2 className="text-xl font-semibold text-slate-900">Your Rewards Journey</h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Points Balance */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm ">
            <div className="flex items-center gap-3 -mx-5 -mt-5 mb-4 px-5 py-4 rounded-t-xl bg-indigo-50 text-slate-700">
              <FaAward className="h-5 w-5 text-violet-600" />
              <span className="font-medium">Points Balance</span>
            </div>
            <div className='flex justify-between'>
            <div className="text-4xl font-bold text-violet-700">
              {loadingStatus ? '—' : (status?.points ?? 0)}

            </div>

                  <RiMedalFill className="h-12 w-12 text-yellow-500 medal-animate" />

            </div>
 
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div>Progress to <span className="font-medium">$5 Gift Card</span></div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  {loadingStatus ? '—' : `${status?.points ?? 0}/5000`}
                </div>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-violet-600" style={{ width: `${Math.min(100, ((status?.points ?? 0) / 5000) * 100)}%` }} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-slate-600">
              <span className="inline-flex h-3 w-3 items-center justify-center text-violet-600">🚀</span>
              <span className='text-xs'>Just getting started — keep earning points!</span>
            </div>
            {errorStatus && (
              <div className="mt-3 text-xs text-red-600">{errorStatus}</div>
            )}
          </div>

          {/* Daily Streak */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 -mx-5 -mt-5 mb-3 px-5 py-4 rounded-t-xl bg-indigo-50 text-slate-700">
              <FiCalendar className="h-5 w-5 text-violet-600" />
              <span className="font-medium">Daily Streak</span>
            </div>
            <div className="text-4xl font-bold text-violet-700">
              {loadingStatus ? '—' : `${status?.streakDays ?? 0} day${(status?.streakDays ?? 0) === 1 ? '' : 's'}`}
            </div>
            <div className="mt-4 flex items-center gap-3">
              {(() => {
                const claimedIndices = new Set<number>()
                if (status) {
                  const base = new Date()
                  if (!status.hasClaimedToday) base.setDate(base.getDate() - 1)
                  for (let i = 0; i < (status.streakDays || 0); i++) {
                    const d = new Date(base)
                    d.setDate(base.getDate() - i)
                    const idx = ((d.getDay() + 6) % 7)
                    claimedIndices.add(idx)
                  }
                }
                return ['M','T','W','T','F','S','S'].map((d, idx) => (
                  <DayChip
                    key={idx}
                    label={d}
                    active={idx === currentDayIndex}
                    highlight={idx === currentDayIndex}
                    claimed={claimedIndices.has(idx)}
                  />
                ))
              })()}
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-600">Check in daily to earn +5 points</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleClaimToday}
                disabled={loadingStatus || status?.hasClaimedToday || claiming}
                className={`w-full md:w-auto inline-flex items-center gap-2 px-4 py-2 cursor-pointer text-sm rounded-2xl transition
                  ${status?.hasClaimedToday ? 'bg-slate-100 text-slate-700 cursor-not-allowed' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
              >
                <FiZap className="h-5 w-5" />
                <span>{claiming ? 'Claiming…' : (status?.hasClaimedToday ? 'Claimed Today' : "Claim Today's Point")}</span>
              </button>
            </div>
          </div>

          {/* Top Tool Spotlight */}
          <div className="rounded-xl p-[1px] bg-gradient-to-br from-violet-600 to-sky-500 shadow-sm">
            <div className="rounded-xl bg-white/10 p-5">
            <div className='flex justify-between'>
                <div>
                     <div className="text-white/90 text-xs font-medium mb-2">Featured</div>
                    <div className="text-white text-xl font-semibold">Top Tool Spotlight</div>
                    <div className="text-white text-base mt-1">Reclaim</div>
                </div>
                <div>
                         {/* Decorative shapes in a circular container with diagonal circles */}
              <div className="mt-4 flex items-center justify-end">
                <div className="relative h-13 w-13 rounded-full bg-[#5562eb] overflow-hidden">
                  {/* Top-left small circle */}
                  {/* Bottom-right small circle (diagonal to the first) */}
                  <div className="absolute bottom-3 right-3 h-3 w-3 rounded-full bg-white/60" />

                  <div className="absolute top-3 left-3 h-3 w-3 rounded-full bg-black" />

                  {/* Triangle */}
                  <div
                    className="absolute"
                    style={{
                      top: '8px',
                      right: '13px',
                      width: 0,
                      height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderBottom: '10px solid rgba(255,255,255,0.7)'
                    }}
                  />
                  {/* Square */}
                  <div className="absolute bottom-3 left-3 h-3 w-3 bg-[#ee9ab2]" />
                </div>
              </div>
                </div>
            </div>
             
              <div className="mt-3 text-white/90 text-sm">
                Automate and Optimize Your Schedule. Reclaim.ai is an AI-powered calendar
                assistant that automatically schedules your tasks, meetings, and breaks to
                boost productivity.
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  className="inline-flex flex-row items-center gap-2 px-4 py-2 rounded-full bg-whitey bg-[#9013fe] text-white font-medium shadow-sm hover:bg-violet-50y cursor-pointer transition text-xs"
                >
                  <FiUserPlus className="h-3 w-3" />
                  <span>Sign up</span>
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-800/70y bg-[#cb51bf] text-white font-medium hover:bg-violet-700 transition text-xs cursor-pointer"
                >
                  <FiGift className="h-3 w-3" />
                  <span>Claim 50 pts</span>
                </button>
              </div>


            </div>
          </div>
        </div>
        {showModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
            <div className="relative w-[90%] max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <button type="button" aria-label="Close" onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-slate-500 hover:text-slate-700">×</button>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-50 border border-green-200 text-green-600 flex items-center justify-center">
               
                <FiCheckCircle className='h-10 w-10'/>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-slate-900">Level Up! 🎉</div>
                <div className="mt-2 text-2xl font-bold text-violet-700">+5 Points</div>
                <div className="mt-3 text-sm text-slate-600">You've claimed your daily points! Come back tomorrow for more!</div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Earn More Points */}
      <div className="w-full px-3 sm:px-6 max-w-full md:max-w-5xl mx-auto mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-6 w-1 rounded bg-violet-600" />
          <h2 className="text-xl font-semibold text-slate-900">Earn More Points</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* Refer and win */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-500 hover:ring-2 hover:ring-violet-300">
            <div className="flex items-center gap-3 p-5">
              <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <FiStar className="h-4 w-4" />
              </div>
              <div className="font-medium text-slate-800">Refer and win 10,000 points!</div>
            </div>
            <div className="px-5 pb-5 text-sm text-slate-700 font-semibold">
              Invite 3 friends by Nov 20 and earn a chance to be one of 5 winners of <span className="font-semibold text-violet-700">10,000 points</span>. Friends must complete onboarding to qualify.
            </div>
          </div>
          {/* Share your stack */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-500 hover:ring-2 hover:ring-violet-300">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <FiShare2 className="h-4 w-4" />
                </div>
                <div>
                <div className="font-medium text-slate-800">Share Your Stack</div>
                <div className="text-xs text-slate-600">Earn +25 pts</div>

                </div>
              </div>
            </div>
            <div className="px-5 pb-5 text-sm text-slate-700 flex items-center justify-between">
              <span className='font-semibold'>Share your tool stack</span>
              <button type="button" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-violet-700 hover:bg-indigo-100 transition text-sm">
                <FiShare2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Refer & Earn */}
      <div className="w-full px-3 sm:px-6 max-w-full md:max-w-7xl mx-auto mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-6 w-1 rounded bg-violet-600" />
          <h2 className="text-xl font-semibold text-slate-900">Refer & Earn</h2>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-indigo-50">
          <div className="flex items-center gap-3 p-5">
            <div className="h-8 w-8 rounded-full bg-white text-indigo-700 flex items-center justify-center border border-indigo-200">
              <FiLink className="h-4 w-4" />
            </div>
            <div>
              <div className="text-slate-900 font-medium">Share Your Link</div>
              <div className="text-sm text-slate-600">Invite friends and earn 25 points when they join!</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-5 pb-6">
            <div className="flex flex-col items-center justify-center rounded-xl bg-white/60 py-6">
              <div className="text-violet-700 text-2xl font-bold">0</div>
              <div className="text-sm text-slate-600">Referrals</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl bg-white/60 py-6">
              <div className="text-violet-700 text-2xl font-bold">0</div>
              <div className="text-sm text-slate-600">Points Earned</div>
            </div>
          </div>
          <div className="px-5 pb-6">
            <div className="rounded-xl bg-violet-50/50 border border-violet-100 p-4">
              <label className="text-sm text-slate-600 mb-2 block">Your personal referral link:</label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={referralLink}
                  className="flex-1 rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
                <button
                  onClick={handleCopy}
                  aria-label="Copy referral link"
                  className="h-10 w-10 rounded-lg cursor-pointer border border-violet-300 bg-white text-violet-600 flex items-center justify-center hover:bg-violet-50 hover:border-violet-500 transition"
                >
                  {copied ? <FiCheck className="h-5 w-5" /> : <FiCopy className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-center gap-5">
              <a href="#" aria-label="Share on Facebook" className="h-8 w-8 rounded-full bg-whitey bg-[#1877F2] border border-slate-200 shadow-sm flex items-center justify-center text-[#1877F2]y text-white hover:shadow-lg transition">
                <FaFacebookF className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Share on X" className="h-8 w-8 rounded-full bg-whitey bg-[#000000] border border-slate-200 shadow-sm flex items-center justify-center text-blacky text-white hover:shadow-lg transition">
                <FaXTwitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Share on LinkedIn" className="h-8 w-8 rounded-full bg-whitey bg-[#0077b5] border border-slate-200 shadow-sm flex items-center justify-center text-[#0A66C2]y text-white hover:shadow-lg transition">
                <FaLinkedinIn className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Share on WhatsApp" className="h-8 w-8 rounded-full bg-whitey bg-[#25d366] border border-slate-200 shadow-sm flex items-center justify-center text-[#25D366]y text-white hover:shadow-lg transition">
                <FaWhatsapp className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {tab === 'redeem' && (
        <div className="w-full px-3 sm:px-6 max-w-full md:max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-6 w-1 rounded bg-violet-600" />
            <h2 className="text-xl font-semibold text-slate-900">Redeem Your Points</h2>
          </div>
          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <button className="px-4 py-2 rounded-xl border border-violet-300 bg-violet-50 text-violet-700 font-medium inline-flex items-center gap-2">
              <span className='text-xs'>All Rewards</span>
              <span className="h-6 w-6 inline-flex items-center justify-center rounded-full bg-violet-600 text-white text-xs">8</span>
            </button>
            <button className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 inline-flex items-center gap-2">
              <span className="text-xs text-slate-700/70">Unlocked</span>
              <span className="h-6 w-6 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-700 text-xs">0</span>
            </button>
            <button className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 inline-flex items-center gap-2">
              <span className="text-xs text-slate-700/70">Locked</span>
              <span className="h-6 w-6 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-700 text-xs">7</span>
            </button>
            <button className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 inline-flex items-center gap-2">
              <span className="text-xs text-slate-700/70">Coming Soon</span>
              <span className="h-6 w-6 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-700 text-xs">1</span>
            </button>
          </div>

          {/* Rewards Grid: 3 columns x rows, 8 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: '$5 Bank Transfer', desc: 'The $5 equivalent will be transferred to your bank account.', points: 5000, icon: <FiDollarSign className="h-5 w-5 text-green-500" /> },
              { title: '$5 PayPal International', desc: 'Receive a $5 PayPal balance transfer directly to your PayPal account email.', points: 5000, icon: <FiCreditCard className="h-5 w-5" /> },
              { title: '$5 Virtual Visa Card', desc: 'Use your $5 prepaid card to shop anywhere Visa is accepted online.', points: 5000, icon: <FiCreditCard className="h-5 w-5 " /> },
              { title: '$5 Amazon Gift Card', desc: 'Redeem for an Amazon gift card usable across many categories.', points: 5000, icon: <FiGift className="h-5 w-5 text-yellow-500" /> },
              { title: '$5 Apple Gift Card', desc: 'Redeem this $5 Apple Gift Card for apps, games, music, movies, and more on the App Store and iTunes.', points: 5000, icon: <FiGift className="h-5 w-5 text-yellow-500" /> },
              { title: '$5 Google Play Credit', desc: 'Use this $5 Google Play Gift Card to purchase apps, games, movies, books, and more on the Google Play Store.', points: 5000, icon: <FiGift className="h-5 w-5 text-yellow-500" /> },
              { title: '$10 Amazon Gift Card', desc: 'Get a $10 digital gift card to spend on your favorite tools or platforms.', points: 10000, icon: <FiGift className="h-5 w-5 text-yellow-500" /> },
              { title: 'Free Udemy Course', desc: 'Coming soon.', points: 0, icon: <FiGift className="text-yellow-500 h-5 w-5" /> },
            ].map((item, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-violet-500">
                <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-200 text-violet-700 flex items-center justify-center">
                  {item.icon}
                </div>
                <div className="text-center">
                  <div className="text-slate-900 font-semibold">{item.title}</div>
                  <div className="mt-2 text-sm text-slate-600">{item.desc}</div>
                </div>
                <div className="mt-5 flex items-center justify-center gap-2 text-sm">
                  <FaStar className="h-4 w-4 text-yellow-500" />
                  <span className="text-slate-700">{item.points} pts</span>
                </div>
                <div className="mt-5">
                  <button type="button" disabled className="w-full rounded-xl bg-slate-100 text-slate-500 text-xs text-center py-3 opacity-60 cursor-not-allowed">Locked</button>
                </div>
              </div>
            ))}
        </div>
      </div>
      )}
    </div>
  )
}

export default RewardHub
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { AuthUser, AuthContextValue } from '../types'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      setError(null)
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const meta = session.user.user_metadata || {}
        setUser({ id: session.user.id, email: session.user.email ?? null, name: meta.full_name || meta.name || null })
      } else {
        setUser(null)
      }
      setLoading(false)
    }
    init()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {}
        setUser({ id: session.user.id, email: session.user.email ?? null, name: meta.full_name || meta.name || null })
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription?.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
    if (error) setError(error.message)
    setLoading(false)
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signOut()
    if (error) setError(error.message)
    setLoading(false)
  }

  const value = useMemo(() => ({ user, loading, error, signIn, signUp, signOut }), [user, loading, error])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
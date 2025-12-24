// Centralized shared types
import type React from 'react'

// Auth types
export type AuthUser = {
  id: string
  email: string | null
  name?: string | null
  initials?: string
}

export type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

// Sidebar types
export type SidebarLink = {
  key: string
  label: string
  icon?: React.ReactNode
}

export type SidebarProps = {
  links: SidebarLink[]
  activeKey: string
  onSelect: (key: string) => void
  user?: { name: string; email: string }
}

// Form types
export type SignInForm = {
  email: string
  password: string
}

export type SignUpForm = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

// Points & Rewards
export type PointsStatus = {
  points: number
  hasClaimedToday: boolean
  streakDays: number
}
import React from 'react'
import logo from "../assets/images/flowva_logo.png"
import type {  SidebarProps } from '../types'
import { useAuth } from '../context/AuthContext'

const Sidebar: React.FC<SidebarProps> = ({ links, activeKey, onSelect, user }) => {
  const { signOut, loading } = useAuth()
  return (
    <nav
      className="w-full md:w-1/4y md:w-[20%] border-b md:border-b-0 md:border-r border-slate-200 bg-white p-4 flex flex-col md:sticky md:top-0 md:h-screen overflow-y-auto"
      aria-label="Primary"
    >
      <div className="flex items-center gap-2 mb-3">
        <img src={logo} alt="Logo" className="h-18 w-50" />
      
      </div>
      <ul className="space-y-2">
        {links.map((link) => {
          const isActive = link.key === activeKey
          return (
            <li key={link.key}>
              <button
                type="button"
                onClick={() => onSelect(link.key)}
                aria-current={isActive ? 'page' : undefined}
                className={
                  `w-full flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md text-black transition-all duration-200
                  hover:bg-[#e9d0ff] hover:text-gray-700 hover:translate-x-0.5
                  ${isActive ? 'bg-[#e9d0ff] text-slate-900' : ''}`
                }
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
      {user && (
        <div className="mt-6 md:mt-auto pt-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#00897b] text-white flex items-center justify-center font-semibold">
              {(user.email?.[0] || '?').toUpperCase()}
            </div>
            <div className="leading-tight">
              <div className="text-sm font-medium text-slate-900">{user.name}</div>
              <div className="text-xs text-slate-600">{user.email}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            disabled={loading}
            className="mt-3 w-full inline-flex items-center text-sm justify-center px-3 py-2 rounded-md bg-violet-600 text-white hover:bg-violet-700 transition cursor-pointer disabled:opacity-60"
          >
            {loading ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>
      )}
    </nav>
  )
}

export default Sidebar
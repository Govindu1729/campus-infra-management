'use client'

import { useEffect, useState } from 'react'
import NotificationBell from './NotificationBell'

interface User {
  id: number
  email: string
  name: string
  isAdmin: boolean
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            setUser(data.user)
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5">
          <img src="/iitgn-logo.svg" alt="IITGN" className="h-7 w-7 object-contain" />
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold text-gray-900 tracking-tight">Digital Infra</span>
            <span className="text-xs text-gray-500 font-medium">IIT Gandhinagar</span>
          </div>
        </a>

        <div className="flex items-center gap-1">
          {user && <NotificationBell />}
          <nav className="flex items-center gap-1">
            <a href="/" className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">Calendar</a>
            <a href="/directory" className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">Directory</a>
            
            {/* Only show Admin/Analytics to admins */}
            {user?.isAdmin && (
              <>
                <a href="/admin/analytics" className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">Analytics</a>
                <a href="/admin/permissions" className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">Admin</a>
              </>
            )}
            
            {user && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md cursor-pointer ml-2"
              >
                Sign out
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

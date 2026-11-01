'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bell, CalendarDays, Clock3, History } from 'lucide-react'
import { CalendarEvent } from '@/types'
import TaskList from './TaskList'

interface Props {
  events: CalendarEvent[]
  userId?: number
  userName: string
  userEmail: string
  isAdmin: boolean
  userModules: string[]
  onSelect: (e: CalendarEvent) => void
}

const fmtTime = (d: Date) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
const fmtDay = (d: Date) => d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })

export default function DashboardSidebar({ events, userId, userName, userEmail, isAdmin, userModules, onSelect }: Props) {
  const [position, setPosition] = useState('')
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Designation: prefer FIC Directory (open to all), fall back to /api/users (admin-only)
  useEffect(() => {
    if (!userEmail) return
    let cancelled = false
    fetch('/api/directory')
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d?.data) ? d.data : []
        const me = list.find((c: any) => c.primaryEmail === userEmail)
        if (!cancelled && me?.officialTitle) {
          setPosition(me.officialTitle)
        } else if (!cancelled) {
          fetch('/api/users').then(r => r.json()).then(u => {
            const ul = Array.isArray(u?.data) ? u.data : Array.isArray(u?.users) ? u.users : []
            const mu = ul.find((x: any) => x.email === userEmail)
            if (!cancelled && mu) setPosition(mu.positionTitle || mu.name || '')
          }).catch(() => {})
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [userEmail])

  // Domain scoping: admins see all; FICs see only their domain(s)
  const inDomain = (e: CalendarEvent) =>
    isAdmin ? true : userModules.length > 0 ? userModules.includes(e.sourceModule) : false

  const upcomingMine = useMemo(
    () =>
      events
        .filter(e => {
          if (new Date(e.startTime).getTime() < now.getTime()) return false
          const parts = ((e as any).participants ?? []) as any[]
          return parts.some(p => p.userId === userId) || (e as any).createdBy === userId
        })
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 5),
    [events, userId, now]
  )

  const deadlines = useMemo(
    () =>
      events
        .filter(e => (e as any).eventType === 'DEADLINE' && new Date(e.startTime).getTime() >= now.getTime() && inDomain(e))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 4),
    [events, now, isAdmin, userModules]
  )

  const past = useMemo(
    () =>
      events
        .filter(e => new Date(e.endTime).getTime() < now.getTime() && inDomain(e))
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 5),
    [events, now, isAdmin, userModules]
  )

  const todayCount = events.filter(e => new Date(e.startTime).toDateString() === now.toDateString()).length

  const countdown = (d: Date) => {
    const days = Math.ceil((d.getTime() - now.getTime()) / 86400000)
    if (days <= 0) return 'today'
    if (days === 1) return 'tomorrow'
    return `in ${days} days`
  }

  return (
    <aside className="space-y-4">
      {/* Identity */}
      <div className="bg-white border border-gray-200 rounded-md p-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Signed in</p>
        <p className="mt-1.5 text-sm font-semibold text-gray-900">{userName || '—'}</p>
        <p className="text-sm text-gray-700">{position || '—'}</p>
        <p className="text-xs text-gray-500 mt-0.5">{userEmail}</p>
      </div>

      {/* Today — the single live clock */}
      <div className="bg-white border border-gray-200 rounded-md p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Today</p>
          <Clock3 className="h-4 w-4 text-gray-400" />
        </div>
        <p className="mt-1.5 text-sm font-semibold text-gray-900">
          {now.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
        <p className="text-2xl font-semibold text-gray-900 tabular-nums mt-1">
          {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          <span className="text-xs text-gray-500 ml-1">IST</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">{todayCount} event{todayCount === 1 ? '' : 's'} scheduled today</p>
      </div>

      {/* My meetings — personal */}
      <div className="bg-white border border-gray-200 rounded-md p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">My meetings</p>
          <CalendarDays className="h-4 w-4 text-gray-400" />
        </div>
        {upcomingMine.length === 0 ? (
          <p className="text-sm text-gray-500">No upcoming meetings.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {upcomingMine.map(e => {
              const s = new Date(e.startTime)
              const meta = (e.metadata || {}) as any
              return (
                <li key={e.id}>
                  <button onClick={() => onSelect(e)} className="w-full text-left py-2 hover:bg-gray-50 rounded px-1 -mx-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{e.title}</p>
                    <p className="text-xs text-gray-500 tabular-nums">
                      {fmtDay(s)} · {fmtTime(s)}{meta.location ? ` · ${meta.location}` : ''}
                    </p>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Deadlines — domain scoped */}
      <div className="bg-white border border-gray-200 rounded-md p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Deadlines</p>
          <Bell className="h-4 w-4 text-gray-400" />
        </div>
        {deadlines.length === 0 ? (
          <p className="text-sm text-gray-500">No upcoming deadlines.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {deadlines.map(e => (
              <li key={e.id}>
                <button onClick={() => onSelect(e)} className="w-full text-left py-2 hover:bg-gray-50 rounded px-1 -mx-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{e.title}</p>
                    <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 whitespace-nowrap">
                      {countdown(new Date(e.startTime))}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 tabular-nums">{fmtDay(new Date(e.startTime))}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recently concluded — domain scoped */}
      <div className="bg-white border border-gray-200 rounded-md p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recently concluded</p>
          <History className="h-4 w-4 text-gray-400" />
        </div>
        {past.length === 0 ? (
          <p className="text-sm text-gray-500">No past events in your domain.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {past.map(e => {
              const s = new Date(e.startTime)
              const meta = (e.metadata || {}) as any
              return (
                <li key={e.id}>
                  <button onClick={() => onSelect(e)} className="w-full text-left py-2 hover:bg-gray-50 rounded px-1 -mx-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{e.title}</p>
                    <p className="text-xs text-gray-500 tabular-nums">
                      {fmtDay(s)}{meta.location ? ` · ${meta.location}` : ''}
                    </p>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <TaskList />
    </aside>
  )
}

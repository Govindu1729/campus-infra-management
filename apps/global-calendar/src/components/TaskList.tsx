'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react'

interface Task {
  id: number
  title: string
  deadline: string
  priority: string
  status: string
  assignees: { user: { name: string } }[]
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    fetch('/api/tasks')
      .then(r => r.json())
      .then(d => {
        if (d.success) setTasks(d.tasks.slice(0, 5))
      })
      .catch(() => {})
  }, [])

  const priorityIcon = (p: string) => {
    if (p === 'URGENT') return <AlertTriangle className="h-3 w-3 text-red-500" />
    if (p === 'HIGH') return <AlertTriangle className="h-3 w-3 text-orange-500" />
    return <Clock className="h-3 w-3 text-gray-400" />
  }

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">My tasks</p>
      {tasks.length === 0 ? (
        <p className="text-sm text-gray-500">No tasks assigned.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {tasks.map(t => {
            const deadline = new Date(t.deadline)
            const overdue = deadline < new Date() && t.status !== 'COMPLETED'
            return (
              <li key={t.id} className="py-2">
                <div className="flex items-start gap-2">
                  {priorityIcon(t.priority)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span className={overdue ? 'text-red-600 font-medium' : ''}>
                        {deadline.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                      {t.assignees.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="truncate">{t.assignees.map(a => a.user.name).join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

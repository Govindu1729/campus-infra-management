'use client'

import { useEffect, useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'

interface Category { id: number; name: string }
interface Contact {
  id: number; officialTitle: string; primaryEmail: string; secondaryEmails?: string
  systemRole: string; functionalCategory: Category
  parentContact?: { officialTitle: string } | null
  secondaryContacts?: { officialTitle: string }[]
}

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin', DEAN_ADMIN: 'Dean', ASSOCIATE_DEAN: 'Assoc. Dean',
  COMMITTEE_CHAIR: 'Chair', HOD: 'HoD', FIC_COORDINATOR: 'FIC', CO_COORDINATOR: 'Co-coordinator',
}

export default function DirectoryPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/directory')
      .then(r => r.json())
      .then(d => { 
        if (d.success) {
          setContacts(d.data)
        } else {
          setError(d.message || 'Access denied')
        }
      })
      .catch(() => setError('Failed to load directory'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => contacts.filter(c => {
    const matchesQ = q === '' || c.officialTitle.toLowerCase().includes(q.toLowerCase()) || c.primaryEmail.toLowerCase().includes(q.toLowerCase())
    const matchesCat = !cat || c.functionalCategory.name === cat
    return matchesQ && matchesCat
  }), [contacts, q, cat])

  if (loading) return <div className="p-8 text-sm text-gray-500 text-center">Loading directory…</div>
  
  if (error) return (
    <div className="max-w-[1600px] mx-auto px-6 py-8">
      <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
        <p className="text-sm font-medium text-red-900">{error}</p>
        <p className="text-xs text-red-700 mt-2">The Faculty Directory is restricted to module owners, heads of departments, and administrators.</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Faculty Directory</h1>
        <p className="text-sm text-gray-500 mt-1">{contacts.length} officials across IIT Gandhinagar</p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input placeholder="Search by title or email…" value={q} onChange={e => setQ(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-md text-sm" />
        </div>
        <select value={cat || ''} onChange={e => setCat(e.target.value || null)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-md text-sm">
          <option value="">All categories</option>
          <option value="ACADEMIC">Academic</option>
          <option value="STUDENT_WELFARE">Student Welfare</option>
          <option value="INFRASTRUCTURE">Infrastructure</option>
          <option value="RESEARCH_ADVANCEMENT">Research & Advancement</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left px-4 py-2.5 font-medium">Official</th>
              <th className="text-left px-4 py-2.5 font-medium">Contact</th>
              <th className="text-left px-4 py-2.5 font-medium">Role</th>
              <th className="text-left px-4 py-2.5 font-medium">Hierarchy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-500">No matches</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} onClick={() => window.location.href = `/directory/${c.id}`} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-3 text-gray-900 font-medium">{c.officialTitle}</td>
                <td className="px-4 py-3">
                  <a href={`mailto:${c.primaryEmail}`} onClick={e => e.stopPropagation()} className="text-gray-900 hover:text-blue-900">{c.primaryEmail}</a>
                  {c.secondaryEmails && <div className="text-xs text-gray-500 mt-0.5">{c.secondaryEmails}</div>}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block text-xs font-medium text-gray-700">{ROLE_LABEL[c.systemRole] || c.systemRole}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {c.parentContact && <div>Reports to: {c.parentContact.officialTitle}</div>}
                  {c.secondaryContacts && c.secondaryContacts.length > 0 && (
                    <div>Secondary: {c.secondaryContacts.map(s => s.officialTitle).join(', ')}</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

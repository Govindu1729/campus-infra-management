import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Directory is restricted to:
    // 1. System admins
    // 2. Users with specific high-level roles (HOD, FIC, Dean, etc.)
    const allowedRoles = ['SUPER_ADMIN', 'DEAN_ADMIN', 'ASSOCIATE_DEAN', 'HOD', 'FIC_COORDINATOR']
    
    if (!user.isAdmin) {
      // Check if user has any of the allowed roles
      const userContact = await prisma.ficContact.findFirst({
        where: { primaryEmail: user.email },
        select: { systemRole: true }
      })
      
      if (!userContact || !allowedRoles.includes(userContact.systemRole)) {
        return NextResponse.json(
          { success: false, message: 'Access denied. Directory is restricted to module owners and administrators.' },
          { status: 403 }
        )
      }
    }

    const contacts = await prisma.ficContact.findMany({
      include: {
        functionalCategory: true,
        parentContact: { select: { officialTitle: true, primaryEmail: true } },
        secondaryContacts: { select: { officialTitle: true, primaryEmail: true } },
      },
      orderBy: [
        { functionalCategoryId: 'asc' },
        { systemRole: 'asc' },
        { officialTitle: 'asc' }
      ]
    })
    return NextResponse.json({ success: true, data: contacts })
  } catch (error) {
    console.error('Directory fetch error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch directory' }, { status: 500 })
  }
}

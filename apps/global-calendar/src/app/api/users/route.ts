export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth, requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(await getAuthUser(request))
    requireAdmin(user)

    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        email: true,
        name: true,
        positionTitle: true,
        isSystemAdmin: true,
        modulePermissions: { select: { moduleName: true, canView: true, canEdit: true } },
      },
    })

    return NextResponse.json({ success: true, users })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
      if (error.message.startsWith('Forbidden')) return NextResponse.json({ success: false, message: error.message }, { status: 403 })
    }
    console.error('GET /api/users error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

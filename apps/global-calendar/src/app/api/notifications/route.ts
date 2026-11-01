import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = requireAuth(await getAuthUser(request))
  const { searchParams } = new URL(request.url)
  const unreadOnly = searchParams.get('unread') === 'true'
  const limit = parseInt(searchParams.get('limit') || '20')

  const where: any = { recipientId: user.id }
  if (unreadOnly) where.readAt = null

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  const unreadCount = await prisma.notification.count({
    where: { recipientId: user.id, readAt: null },
  })

  return NextResponse.json({
    success: true,
    notifications,
    unreadCount,
  })
}

export async function PATCH(request: NextRequest) {
  const user = requireAuth(await getAuthUser(request))
  const body = await request.json()
  const { notificationIds } = body

  await prisma.notification.updateMany({
    where: {
      id: { in: notificationIds },
      recipientId: user.id,
    },
    data: { readAt: new Date() },
  })

  return NextResponse.json({ success: true })
}

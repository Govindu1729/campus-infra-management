import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth } from '@/lib/auth'
import { extractRoomKeys } from '@/lib/conflicts'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    requireAuth(await getAuthUser(request))
    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const exclude = searchParams.get('excludeEventId')

    const rooms = await prisma.room.findMany({
      orderBy: [{ building: 'asc' }, { roomNumber: 'asc' }],
    })

    if (!start || !end) {
      return NextResponse.json({
        success: true,
        rooms: rooms.map((r) => ({ ...r, available: true, conflicts: [] })),
      })
    }

    const startDate = new Date(start)
    const endDate = new Date(end)
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate <= startDate) {
      return NextResponse.json({
        success: true,
        rooms: rooms.map((r) => ({ ...r, available: true, conflicts: [] })),
      })
    }

    const overlapping = await prisma.calendarEvent.findMany({
      where: {
        status: 'ACTIVE',
        recurrenceRule: null,
        startTime: { lt: endDate },
        endTime: { gt: startDate },
        ...(exclude ? { id: { not: Number(exclude) } } : {}),
      },
      select: { id: true, title: true, sourceModule: true, startTime: true, endTime: true, metadata: true, createdBy: true },
    })

    const creatorIds = Array.from(new Set(overlapping.map((o) => o.createdBy)))
    const creators = creatorIds.length
      ? await prisma.user.findMany({ where: { id: { in: creatorIds } }, select: { id: true, name: true } })
      : []
    const nameById = new Map(creators.map((c) => [c.id, c.name]))

    const result = rooms.map((room) => {
      const conflicts = overlapping
        .filter((ev) => extractRoomKeys((ev.metadata as Record<string, unknown>) ?? {}).includes(room.label))
        .map((ev) => ({
          id: ev.id.toString(),
          title: ev.title,
          sourceModule: ev.sourceModule,
          startTime: ev.startTime.toISOString(),
          endTime: ev.endTime.toISOString(),
          creatorName: nameById.get(ev.createdBy) ?? null,
        }))
      return { ...room, available: conflicts.length === 0, conflicts }
    })

    return NextResponse.json({ success: true, rooms: result })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    console.error('GET /api/rooms/availability error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

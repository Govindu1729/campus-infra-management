import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { updateEventSchema } from '@/lib/validators'
import { getAuthUser, requireAuth, canAccessModule } from '@/lib/auth'
import { safeJson } from '@/lib/serialize'
import { extractRoomKeys, findRoomConflicts, conflictMessage } from '@/lib/conflicts'

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } }

function clientIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
}

function fail(error: unknown, context: string) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ success: false, errors: error.issues }, { status: 400 })
  }
  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    if (error.message.startsWith('Forbidden')) {
      return NextResponse.json({ success: false, message: error.message }, { status: 403 })
    }
  }
  console.error(`${context} error:`, error)
  return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
}

export async function GET(request: NextRequest, { params }: Ctx) {
  try {
    const user = requireAuth(await getAuthUser(request))
    const event = await prisma.calendarEvent.findUnique({
      where: { id: Number(params.id) },
      include: { participants: true },
    })
    if (!event) return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 })

    if (event.visibility === 'ADMIN_ONLY' && !user.isAdmin) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }
    if (!(await canAccessModule(user, event.sourceModule, 'view'))) {
      return NextResponse.json({ success: false, message: 'Forbidden: No access to this module' }, { status: 403 })
    }

    return NextResponse.json({ success: true, event: safeJson(event) })
  } catch (error) {
    return fail(error, 'GET /api/events/[id]')
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    const user = requireAuth(await getAuthUser(request))
    const eventId = Number(params.id)
    const validated = updateEventSchema.parse(await request.json())

    const existing = await prisma.calendarEvent.findUnique({ where: { id: eventId } })
    if (!existing) return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 })

    if (!(await canAccessModule(user, existing.sourceModule, 'edit'))) {
      return NextResponse.json({ success: false, message: 'Forbidden: No edit access' }, { status: 403 })
    }

    const nextStart = validated.startTime ?? existing.startTime
    const nextEnd = validated.endTime ?? existing.endTime
    if (nextEnd <= nextStart) {
      return NextResponse.json({ success: false, message: 'endTime must be after startTime' }, { status: 400 })
    }

    const nextRule = validated.recurrenceRule !== undefined ? validated.recurrenceRule : existing.recurrenceRule
    if (!nextRule) {
      const metaForCheck = (validated.metadata !== undefined
        ? validated.metadata
        : (existing.metadata as Record<string, unknown> | null)) ?? {}
      const roomKeys = extractRoomKeys(metaForCheck)
      if (roomKeys.length > 0) {
        const conflicts = await findRoomConflicts(prisma, nextStart, nextEnd, roomKeys, eventId)
        if (conflicts.length > 0) {
          return NextResponse.json(
            { success: false, code: 'ROOM_CONFLICT', message: conflictMessage(conflicts), conflicts },
            { status: 409 }
          )
        }
      }
    }

    const updateData: Prisma.CalendarEventUpdateInput = {
      title: validated.title,
      description: validated.description,
      sourceModule: validated.sourceModule,
      startTime: validated.startTime,
      endTime: validated.endTime,
      isAllDay: validated.isAllDay,
      eventType: validated.eventType,
      visibility: validated.visibility,
      recurrenceRule: validated.recurrenceRule,
      metadata: validated.metadata as Prisma.InputJsonValue | undefined,
    }

    const updated = await prisma.$transaction(async (tx) => {
      const ev = await tx.calendarEvent.update({
        where: { id: eventId },
        data: updateData,
        include: { participants: true },
      })
      await tx.auditLog.create({
        data: {
          action: 'UPDATE',
          eventId,
          userId: user.id,
          ipAddress: clientIp(request),
          details: { oldValues: safeJson(existing), newValues: safeJson(validated) },
        },
      })
      return ev
    })

    return NextResponse.json({ success: true, event: safeJson(updated) })
  } catch (error) {
    return fail(error, 'PUT /api/events/[id]')
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  try {
    const user = requireAuth(await getAuthUser(request))
    const eventId = Number(params.id)

    const existing = await prisma.calendarEvent.findUnique({ where: { id: eventId } })
    if (!existing) return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 })

    if (!(await canAccessModule(user, existing.sourceModule, 'edit'))) {
      return NextResponse.json({ success: false, message: 'Forbidden: No edit access' }, { status: 403 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.calendarEvent.update({ where: { id: eventId }, data: { status: 'CANCELLED' } })
      await tx.auditLog.create({
        data: {
          action: 'DELETE',
          eventId,
          userId: user.id,
          ipAddress: clientIp(request),
          details: { cancelledEvent: safeJson(existing) },
        },
      })
    })

    return NextResponse.json({ success: true, message: 'Event cancelled' })
  } catch (error) {
    return fail(error, 'DELETE /api/events/[id]')
  }
}

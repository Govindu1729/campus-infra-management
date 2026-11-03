import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth, canAccessModule } from '@/lib/auth'

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } }

const addParticipantsSchema = z.object({
  userIds: z.array(z.number().int().positive()).min(1),
  role: z.enum(['ORGANIZER', 'ATTENDEE', 'OPTIONAL']).optional().default('ATTENDEE'),
})

export async function GET(request: NextRequest, { params }: Ctx) {
  try {
    const user = requireAuth(await getAuthUser(request))
    const eventId = Number(params.id)

    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
      include: {
        participants: {
          include: {
            user: { select: { id: true, email: true, name: true, positionTitle: true } },
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 })
    }

    if (!(await canAccessModule(user, event.sourceModule, 'view'))) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      participants: event.participants.map((p) => ({
        id: p.id.toString(),
        userId: p.userId,
        user: p.user,
        role: p.role,
        rsvpStatus: p.rsvpStatus,
      })),
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    console.error('GET /api/events/[id]/participants error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: Ctx) {
  try {
    const user = requireAuth(await getAuthUser(request))
    const eventId = Number(params.id)
    const validated = addParticipantsSchema.parse(await request.json())

    const event = await prisma.calendarEvent.findUnique({ where: { id: eventId } })
    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 })
    }

    if (!(await canAccessModule(user, event.sourceModule, 'edit'))) {
      return NextResponse.json({ success: false, message: 'Forbidden: No edit access' }, { status: 403 })
    }

    const created = await prisma.$transaction(
      validated.userIds.map((userId) =>
        prisma.eventParticipant.upsert({
          where: { eventId_userId: { eventId, userId } },
          update: { role: validated.role },
          create: { eventId, userId, role: validated.role, rsvpStatus: 'PENDING' },
        })
      )
    )

    return NextResponse.json({
      success: true,
      participants: created.map((p) => ({ ...p, id: p.id.toString() })),
      message: `Added ${created.length} participant(s)`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.issues }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    console.error('POST /api/events/[id]/participants error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

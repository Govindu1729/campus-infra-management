import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } }

const rsvpSchema = z.object({
  status: z.enum(['ACCEPTED', 'DECLINED', 'PENDING']),
})

export async function POST(request: NextRequest, { params }: Ctx) {
  try {
    const user = requireAuth(await getAuthUser(request))
    const eventId = Number(params.id)
    const validated = rsvpSchema.parse(await request.json())

    const participant = await prisma.eventParticipant.findUnique({
      where: { eventId_userId: { eventId, userId: user.id } },
    })

    if (!participant) {
      return NextResponse.json({ success: false, message: 'You are not invited to this event' }, { status: 404 })
    }

    const updated = await prisma.eventParticipant.update({
      where: { eventId_userId: { eventId, userId: user.id } },
      data: { rsvpStatus: validated.status },
    })

    return NextResponse.json({
      success: true,
      participant: { ...updated, id: updated.id.toString() },
      message: `RSVP updated to ${validated.status}`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.issues }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    console.error('POST /api/events/[id]/rsvp error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

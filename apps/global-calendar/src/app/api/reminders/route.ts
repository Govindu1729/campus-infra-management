import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth, canAccessModule } from '@/lib/auth'

const createReminderSchema = z.object({
  eventId: z.number(),
  reminderType: z.enum(['BEFORE_EVENT', 'DEADLINE_APPROACHING', 'TASK_OVERDUE', 'CUSTOM']),
  minutesBefore: z.number().int().min(1),
  channel: z.enum(['IN_APP', 'EMAIL', 'BOTH']).optional().default('IN_APP'),
  message: z.string().max(500).optional(),
})

export async function GET(request: NextRequest) {
  const user = requireAuth(await getAuthUser(request))
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')

  const where: any = {}
  if (eventId) where.eventId = Number(eventId)

  // Filter by events user can see
  const visible = await getVisibleModules(user)
  if (visible !== null) {
    where.event = { sourceModule: { in: visible }, visibility: { not: 'ADMIN_ONLY' } }
  }

  const reminders = await prisma.reminder.findMany({
    where,
    include: { event: true },
    orderBy: { scheduledAt: 'asc' },
  })

  return NextResponse.json({ success: true, reminders })
}

export async function POST(request: NextRequest) {
  const user = requireAuth(await getAuthUser(request))
  const body = await request.json()
  const parsed = createReminderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Validation failed' }, { status: 400 })
  }

  const { eventId, reminderType, minutesBefore, channel, message } = parsed.data

  const event = await prisma.calendarEvent.findUnique({ where: { id: eventId } })
  if (!event) {
    return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 })
  }

  // Check permission
  if (!user.isAdmin) {
    const canEdit = await canAccessModule(user, event.sourceModule, 'edit')
    if (!canEdit) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }
  }

  const scheduledAt = new Date(event.startTime.getTime() - minutesBefore * 60000)

  const reminder = await prisma.reminder.create({
    data: {
      eventId,
      createdBy: user.id,
      reminderType,
      minutesBefore,
      channel,
      message,
      scheduledAt,
    },
    include: { event: true },
  })

  return NextResponse.json({ success: true, reminder })
}

export async function DELETE(request: NextRequest) {
  const user = requireAuth(await getAuthUser(request))
  const { searchParams } = new URL(request.url)
  const reminderId = Number(searchParams.get('id'))

  const reminder = await prisma.reminder.findUnique({ where: { id: reminderId } })
  if (!reminder) {
    return NextResponse.json({ success: false, message: 'Reminder not found' }, { status: 404 })
  }

  // Only creator or admin can delete
  if (reminder.createdBy !== user.id && !user.isAdmin) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
  }

  await prisma.reminder.delete({ where: { id: reminderId } })
  return NextResponse.json({ success: true })
}

async function getVisibleModules(user: any): Promise<string[] | null> {
  if (user.isAdmin) return null
  const perms = await prisma.userModulePermission.findMany({
    where: { userId: user.id, canView: true },
    select: { moduleName: true },
  })
  return perms.map(p => p.moduleName)
}

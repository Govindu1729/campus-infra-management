import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createNotification, sendEmailNotification } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const reminders = await prisma.reminder.findMany({
    where: {
      status: 'PENDING',
      scheduledAt: { lte: now },
    },
    include: {
      event: { include: { participants: { include: { user: true } } } },
    },
  })

  let processed = 0
  let failed = 0

  for (const reminder of reminders) {
    try {
      const event = reminder.event
      const title = `Reminder: ${event.title}`
      const message = reminder.message || `${event.title} starts in ${reminder.minutesBefore} minutes`

      for (const p of event.participants) {
        // In-app notification
        await createNotification({
          recipientId: p.userId,
          type: 'REMINDER',
          title,
          message,
          eventId: event.id,
        })

        // Email if channel is EMAIL or BOTH
        if (reminder.channel === 'EMAIL' || reminder.channel === 'BOTH') {
          await sendEmailNotification(
            p.userId,
            title,
            `<h2>${title}</h2><p>${message}</p><p><strong>When:</strong> ${event.startTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p><p><strong>Where:</strong> ${(event.metadata as any)?.location || 'TBD'}</p>`
          )
        }
      }

      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { status: 'SENT', sentAt: new Date() },
      })

      processed++
    } catch (error) {
      console.error('Failed to process reminder:', error)
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { status: 'FAILED' },
      })
      failed++
    }
  }

  return NextResponse.json({ processed, failed, total: reminders.length })
}

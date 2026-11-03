import { NotificationType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export interface NotificationPayload {
  recipientId: number
  type: 'REMINDER' | 'DEADLINE_ALERT' | 'TASK_ASSIGNED' | 'TASK_OVERDUE' | 'EVENT_UPDATE' | 'CUSTOM'
  title: string
  message: string
  eventId?: number
  taskId?: number
}

export async function createNotification(payload: NotificationPayload) {
  return prisma.notification.create({ data: payload })
}

export async function sendEmailNotification(userId: number, subject: string, html: string) {
  if (!resend) {
    console.log('Email not configured, skipping:', { userId, subject })
    return
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return

  try {
    await resend.emails.send({
      from: 'Campus Calendar <noreply@iitgn.ac.in>',
      to: user.email,
      subject,
      html,
    })
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}

export async function notifyEventParticipants(
  eventId: number,
  title: string,
  message: string,
  type: NotificationType = 'REMINDER'
) {
  const participants = await prisma.eventParticipant.findMany({
    where: { eventId },
    include: { user: true },
  })

  for (const p of participants) {
    await createNotification({
      recipientId: p.userId,
      type,
      title,
      message,
      eventId,
    })
  }
}

export async function notifyModuleMembers(
  sourceModule: string,
  title: string,
  message: string,
  type: NotificationType = 'REMINDER'
) {
  const members = await prisma.userModulePermission.findMany({
    where: { moduleName: sourceModule, canView: true },
    include: { user: true },
  })

  for (const m of members) {
    await createNotification({
      recipientId: m.userId,
      type,
      title,
      message,
    })
  }
}

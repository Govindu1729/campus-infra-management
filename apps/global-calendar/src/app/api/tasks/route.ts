import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth } from '@/lib/auth'
import { canAccessModule } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'

const createTaskSchema = z.object({
  sourceModule: z.string(),
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  deadline: z.string().datetime(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
  assigneeIds: z.array(z.number()).optional(),
})

export async function GET(request: NextRequest) {
  const user = requireAuth(await getAuthUser(request))
  const { searchParams } = new URL(request.url)
  const sourceModule = searchParams.get('sourceModule')
  const status = searchParams.get('status')

  const where: any = {}
  if (sourceModule) where.sourceModule = sourceModule
  if (status) where.status = status

  // Filter by user's visible modules (unless admin)
  if (!user.isAdmin) {
    const perms = await prisma.userModulePermission.findMany({
      where: { userId: user.id, canView: true },
      select: { moduleName: true },
    })
    where.sourceModule = { in: perms.map(p => p.moduleName) }
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignees: { include: { user: true } },
      creator: true,
    },
    orderBy: { deadline: 'asc' },
  })

  return NextResponse.json({ success: true, tasks })
}

export async function POST(request: NextRequest) {
  const user = requireAuth(await getAuthUser(request))
  const body = await request.json()
  const parsed = createTaskSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: 'Validation failed' }, { status: 400 })
  }

  const { sourceModule, title, description, deadline, priority, assigneeIds } = parsed.data

  // Check permission
  if (!user.isAdmin) {
    const canEdit = await canAccessModule(user, sourceModule, 'edit')
    if (!canEdit) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }
  }

  const task = await prisma.task.create({
    data: {
      sourceModule,
      title,
      description,
      deadline: new Date(deadline),
      priority,
      createdBy: user.id,
      assignees: assigneeIds ? {
        create: assigneeIds.map(id => ({ userId: id })),
      } : undefined,
    },
    include: { assignees: { include: { user: true } } },
  })

  // Notify assignees
  if (assigneeIds && assigneeIds.length > 0) {
    for (const assigneeId of assigneeIds) {
      await createNotification({
        recipientId: assigneeId,
        type: 'TASK_ASSIGNED',
        title: 'New task assigned',
        message: `You have been assigned: ${title}`,
        taskId: task.id,
      })
    }
  }

  return NextResponse.json({ success: true, task })
}

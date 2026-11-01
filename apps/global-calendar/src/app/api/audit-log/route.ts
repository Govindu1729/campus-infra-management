export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth, requireAdmin } from '@/lib/auth'

const auditLogQuerySchema = z.object({
  action: z.enum(['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'PERMISSION_CHANGE']).optional(),
  userId: z.coerce.number().int().positive().optional(),
  eventId: z.coerce.number().int().positive().optional(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  limit: z.coerce.number().int().positive().max(1000).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
})

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(await getAuthUser(request))
    requireAdmin(user)

    const { searchParams } = new URL(request.url)
    const query = auditLogQuerySchema.parse(Object.fromEntries(searchParams))

    const where: Prisma.AuditLogWhereInput = {}
    if (query.action) where.action = query.action
    if (query.userId) where.userId = query.userId
    if (query.eventId) where.eventId = query.eventId
    if (query.startTime || query.endTime) {
      where.timestamp = {
        ...(query.startTime ? { gte: query.startTime } : {}),
        ...(query.endTime ? { lte: query.endTime } : {}),
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { event: { select: { title: true, sourceModule: true } } },
        orderBy: { timestamp: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.auditLog.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      logs: logs.map((l) => ({ ...l, id: l.id.toString(), eventId: l.eventId?.toString() ?? null })),
      meta: { total, limit: query.limit, offset: query.offset, hasMore: query.offset + query.limit < total },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.issues }, { status: 400 })
    }
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
      if (error.message.startsWith('Forbidden')) return NextResponse.json({ success: false, message: error.message }, { status: 403 })
    }
    console.error('GET /api/audit-log error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
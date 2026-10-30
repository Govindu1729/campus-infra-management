import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getV1Caller, canWrite, canRead, type V1Caller } from '@/lib/v1/auth'
import { v1CreateEventSchema, v1ListQuerySchema } from '@/lib/v1/validators'
import { toV1Event, v1ToDbCreate } from '@/lib/v1/serialize'

export const dynamic = 'force-dynamic'

function err(code: string, message: string, status: number, requestId: string) {
  return NextResponse.json({ error: { code, message, requestId } }, { status })
}

function makeRequestId() {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export async function GET(request: NextRequest) {
  const requestId = makeRequestId()

  const caller = await getV1Caller(request)
  if (!caller) return err('UNAUTHORIZED', 'Missing or invalid authentication', 401, requestId)

  const parsed = v1ListQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams))
  if (!parsed.success) {
    return err('VALIDATION_ERROR', parsed.error.issues.map(i => i.message).join(', '), 400, requestId)
  }
  const q = parsed.data

  const where: Prisma.CalendarEventWhereInput = {}
  if (q.includeCancelled !== 'true') where.status = 'ACTIVE'
  if (q.from || q.to) {
    where.AND = [
      ...(q.from ? [{ endTime: { gte: new Date(q.from) } }] : []),
      ...(q.to ? [{ startTime: { lte: new Date(q.to) } }] : []),
    ]
  }
  if (q.moduleKey) {
    const { MODULE_KEY_MAP } = await import('@/lib/v1/auth')
    const sm = MODULE_KEY_MAP[q.moduleKey]
    if (sm) where.sourceModule = sm
  }

  // Fetch all candidates, then filter by read permission per-event
  const raw = await prisma.calendarEvent.findMany({
    where,
    orderBy: { startTime: 'asc' },
    take: q.limit,
    skip: q.offset,
  })

  const events = raw
    .filter(e => canRead(caller, e.sourceModule, e.visibility))
    .map(toV1Event)

  const total = await prisma.calendarEvent.count({ where })

  return NextResponse.json(
    { data: events, meta: { total, limit: q.limit, offset: q.offset } },
    { headers: { 'X-Request-Id': requestId } }
  )
}

export async function POST(request: NextRequest) {
  const requestId = makeRequestId()

  const caller = await getV1Caller(request)
  if (!caller) return err('UNAUTHORIZED', 'Missing or invalid authentication', 401, requestId)

  const body = await request.json().catch(() => null)
  if (!body) return err('INVALID_JSON', 'Request body must be JSON', 400, requestId)

  // Reject forbidden fields per spec
  const forbidden = ['moduleKey', 'moduleId', 'ownerModuleKey', 'ownerModuleId']
  const sent = forbidden.filter(f => f in body)
  if (sent.length > 0) {
    return err('FORBIDDEN_FIELD', `Do not send: ${sent.join(', ')}`, 400, requestId)
  }

  const parsed = v1CreateEventSchema.safeParse(body)
  if (!parsed.success) {
    return err('VALIDATION_ERROR', parsed.error.issues.map(i => i.message).join('; '), 400, requestId)
  }

  const sourceModule =
    caller.type === 'module'
      ? caller.sourceModule!
      : parsed.data.relatedEntityType === 'room' ? 'INFRASTRUCTURE' : 'GLOBAL'

  if (!canWrite(caller, sourceModule)) {
    return err('FORBIDDEN', 'Not authorized to create events for this module', 403, requestId)
  }

  // For module calls, use a system user ID (1); for human calls, use the caller's ID
  const userId = caller.type === 'human' ? caller.userId! : 1

  const dbData = v1ToDbCreate(parsed.data, sourceModule, userId)
  const created = await prisma.calendarEvent.create({ data: dbData })

  return NextResponse.json(
    { data: toV1Event(created) },
    { status: 201, headers: { 'X-Request-Id': requestId } }
  )
}

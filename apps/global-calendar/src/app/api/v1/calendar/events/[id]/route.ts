import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getV1Caller, canWrite, canRead } from '@/lib/v1/auth'
import { v1UpdateEventSchema } from '@/lib/v1/validators'
import { toV1Event, v1ToDbUpdate } from '@/lib/v1/serialize'

export const dynamic = 'force-dynamic'

function err(code: string, message: string, status: number, requestId: string) {
  return NextResponse.json({ error: { code, message, requestId } }, { status })
}
function makeRequestId() {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

async function getEvent(id: string) {
  const numId = Number(id)
  if (!Number.isInteger(numId) || numId <= 0) return null
  return prisma.calendarEvent.findUnique({ where: { id: numId } })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = makeRequestId()
  const caller = await getV1Caller(request)
  if (!caller) return err('UNAUTHORIZED', 'Missing or invalid authentication', 401, requestId)

  const event = await getEvent(params.id)
  if (!event) return err('NOT_FOUND', 'Event not found', 404, requestId)
  if (!canRead(caller, event.sourceModule, event.visibility)) {
    return err('FORBIDDEN', 'Not authorized to view this event', 403, requestId)
  }

  return NextResponse.json({ data: toV1Event(event) }, { headers: { 'X-Request-Id': requestId } })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = makeRequestId()
  const caller = await getV1Caller(request)
  if (!caller) return err('UNAUTHORIZED', 'Missing or invalid authentication', 401, requestId)

  const existing = await getEvent(params.id)
  if (!existing) return err('NOT_FOUND', 'Event not found', 404, requestId)
  if (existing.status === 'CANCELLED') {
    return err('ALREADY_CANCELLED', 'Cannot modify a cancelled event', 409, requestId)
  }

  // Modules can only modify their own events
  if (!canWrite(caller, existing.sourceModule)) {
    return err('FORBIDDEN', 'Modules can update only their own events', 403, requestId)
  }

  const body = await request.json().catch(() => null)
  if (!body) return err('INVALID_JSON', 'Request body must be JSON', 400, requestId)

  const parsed = v1UpdateEventSchema.safeParse(body)
  if (!parsed.success) {
    return err('VALIDATION_ERROR', parsed.error.issues.map(i => i.message).join('; '), 400, requestId)
  }

  // Validate end > start with merge
  const newStart = parsed.data.startAt ? new Date(parsed.data.startAt) : existing.startTime
  const newEnd = parsed.data.endAt ? new Date(parsed.data.endAt) : existing.endTime
  if (newEnd <= newStart) {
    return err('VALIDATION_ERROR', 'endAt must be later than startAt', 400, requestId)
  }

  const patch = v1ToDbUpdate(parsed.data)

  // Merge metadata (patch.metadata is partial)
  let mergedMetadata = existing.metadata as any
  if (patch.metadata) {
    mergedMetadata = { ...(mergedMetadata || {}), ...patch.metadata }
    delete patch.metadata
  }

  const updated = await prisma.calendarEvent.update({
    where: { id: existing.id },
    data: { ...patch, metadata: mergedMetadata },
  })

  return NextResponse.json({ data: toV1Event(updated) }, { headers: { 'X-Request-Id': requestId } })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = makeRequestId()
  const caller = await getV1Caller(request)
  if (!caller) return err('UNAUTHORIZED', 'Missing or invalid authentication', 401, requestId)

  const existing = await getEvent(params.id)
  if (!existing) return err('NOT_FOUND', 'Event not found', 404, requestId)
  if (existing.status === 'CANCELLED') {
    return NextResponse.json(
      { data: toV1Event(existing) },
      { headers: { 'X-Request-Id': requestId } }
    )
  }

  if (!canWrite(caller, existing.sourceModule)) {
    return err('FORBIDDEN', 'Modules can cancel only their own events', 403, requestId)
  }

  const updated = await prisma.calendarEvent.update({
    where: { id: existing.id },
    data: { status: 'CANCELLED' },
  })

  return NextResponse.json({ data: toV1Event(updated) }, { headers: { 'X-Request-Id': requestId } })
}

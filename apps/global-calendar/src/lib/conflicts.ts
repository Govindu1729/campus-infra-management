import { PrismaClient } from '@prisma/client'

export interface ConflictHit {
  id: string
  title: string
  sourceModule: string
  startTime: string
  endTime: string
  rooms: string[]
  creatorName: string | null
}

export function extractRoomKeys(metadata: Record<string, unknown> | null | undefined): string[] {
  if (!metadata) return []
  const keys: string[] = []
  const push = (v: unknown) => {
    if (typeof v !== 'string') return
    const n = v.trim().toUpperCase().replace(/\s+/g, ' ')
    if (n) keys.push(n)
  }
  push(metadata.room)
  push(metadata.room_number)
  if (Array.isArray(metadata.rooms)) metadata.rooms.forEach(push)
  if (typeof metadata.building === 'string' && typeof metadata.room_number === 'string') {
    push(`${metadata.building.trim()}-${metadata.room_number.trim()}`)
  }
  return Array.from(new Set(keys))
}

export async function findRoomConflicts(
  prisma: PrismaClient,
  startTime: Date,
  endTime: Date,
  roomKeys: string[],
  excludeEventId?: number
): Promise<ConflictHit[]> {
  if (roomKeys.length === 0) return []

  const overlapping = await prisma.calendarEvent.findMany({
    where: {
      status: 'ACTIVE',
      recurrenceRule: null,
      startTime: { lt: endTime },
      endTime: { gt: startTime },
      ...(excludeEventId !== undefined ? { id: { not: excludeEventId } } : {}),
    },
    select: { id: true, title: true, sourceModule: true, startTime: true, endTime: true, metadata: true, createdBy: true },
  })

  const creatorIds = Array.from(new Set(overlapping.map((o) => o.createdBy)))
  const creators = creatorIds.length
    ? await prisma.user.findMany({ where: { id: { in: creatorIds } }, select: { id: true, name: true } })
    : []
  const nameById = new Map(creators.map((c) => [c.id, c.name]))

  const hits: ConflictHit[] = []
  for (const ev of overlapping) {
    const evRooms = extractRoomKeys((ev.metadata as Record<string, unknown>) ?? {})
    const shared = evRooms.filter((r) => roomKeys.includes(r))
    if (shared.length > 0) {
      hits.push({
        id: ev.id.toString(),
        title: ev.title,
        sourceModule: ev.sourceModule,
        startTime: ev.startTime.toISOString(),
        endTime: ev.endTime.toISOString(),
        rooms: shared,
        creatorName: nameById.get(ev.createdBy) ?? null,
      })
    }
  }
  return hits
}

export function conflictMessage(hits: ConflictHit[]): string {
  const h = hits[0]
  const when = `${new Date(h.startTime).toLocaleString()} - ${new Date(h.endTime).toLocaleString()}`
  const by = h.creatorName ? ` by ${h.creatorName}` : ''
  const more = hits.length > 1 ? ` (+${hits.length - 1} more)` : ''
  return `Room conflict: ${h.rooms.join(', ')} is already booked for "${h.title}" (${when})${by}${more}.`
}

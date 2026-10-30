import { Prisma } from '@prisma/client'
import { MODULE_KEY_MAP } from './auth'

// Map sourceModule to its PRIMARY module key (for response serialization)
// When multiple keys map to the same sourceModule, we pick the first/canonical one
const SOURCE_TO_PRIMARY_MODULE: Record<string, string> = {
  'GLOBAL': 'global-calendar',
  'INFRASTRUCTURE': 'room-info',
  'RESEARCH_ADVANCEMENT': 'rnd',
  'STUDENT_WELFARE': 'student-welfare',
  'ACADEMIC_AFFAIRS': 'academic-affairs',
}

export function toV1Event(e: any) {
  const meta = (e.metadata || {}) as Record<string, any>
  const moduleKey = SOURCE_TO_PRIMARY_MODULE[e.sourceModule] || 'global-calendar'
  
  return {
    id: String(e.id),
    title: e.title,
    description: e.description || null,
    startAt: new Date(e.startTime).toISOString(),
    endAt: new Date(e.endTime).toISOString(),
    timeZone: meta.timeZone || 'Asia/Kolkata',
    allDay: e.isAllDay ?? false,
    location: meta.location || null,
    relatedEntityType: meta.relatedEntityType || null,
    relatedEntityId: meta.relatedEntityId || null,
    moduleKey,
    ownerModuleKey: moduleKey,
    status: e.status === 'CANCELLED' ? 'cancelled' : 'active',
    createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : null,
    updatedAt: e.updatedAt ? new Date(e.updatedAt).toISOString() : null,
  }
}

export function v1ToDbCreate(input: any, sourceModule: string, userId: number) {
  return {
    sourceModule,
    title: input.title,
    description: input.description || null,
    startTime: new Date(input.startAt),
    endTime: new Date(input.endAt),
    isAllDay: input.allDay ?? false,
    eventType: 'MEETING' as const,
    visibility: 'PUBLIC' as const,
    createdBy: userId,
    metadata: {
      location: input.location || null,
      timeZone: input.timeZone || 'Asia/Kolkata',
      relatedEntityType: input.relatedEntityType || null,
      relatedEntityId: input.relatedEntityId || null,
    } as Prisma.InputJsonValue,
  }
}

export function v1ToDbUpdate(input: any) {
  const data: any = {}
  const metaPatch: Record<string, any> = {}

  if (input.title !== undefined) data.title = input.title
  if (input.description !== undefined) data.description = input.description
  if (input.startAt !== undefined) data.startTime = new Date(input.startAt)
  if (input.endAt !== undefined) data.endTime = new Date(input.endAt)
  if (input.allDay !== undefined) data.isAllDay = input.allDay
  if (input.location !== undefined) metaPatch.location = input.location
  if (input.timeZone !== undefined) metaPatch.timeZone = input.timeZone
  if (input.relatedEntityType !== undefined) metaPatch.relatedEntityType = input.relatedEntityType
  if (input.relatedEntityId !== undefined) metaPatch.relatedEntityId = input.relatedEntityId

  if (Object.keys(metaPatch).length > 0) {
    data.metadata = metaPatch
  }

  return data
}

import { z } from 'zod'

const isoWithTz = z.string().refine(
  (s) => {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(s)) return false
    const d = new Date(s)
    return !isNaN(d.getTime())
  },
  { message: 'Must be ISO 8601 with seconds and explicit timezone (e.g. 2026-11-05T09:00:00+05:30)' }
)

export const v1CreateEventSchema = z.object({
  title: z.string().min(1).max(255),
  startAt: isoWithTz,
  endAt: isoWithTz,
  description: z.string().max(2000).optional(),
  timeZone: z.string().optional().default('Asia/Kolkata'),
  allDay: z.boolean().optional().default(false),
  location: z.string().max(500).optional(),
  relatedEntityType: z.string().max(100).optional(),
  relatedEntityId: z.string().max(100).optional(),
}).refine(d => new Date(d.endAt) > new Date(d.startAt), {
  message: 'endAt must be later than startAt',
  path: ['endAt'],
})

export const v1UpdateEventSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  startAt: isoWithTz.optional(),
  endAt: isoWithTz.optional(),
  description: z.string().max(2000).optional(),
  timeZone: z.string().optional(),
  allDay: z.boolean().optional(),
  location: z.string().max(500).optional(),
  relatedEntityType: z.string().max(100).optional(),
  relatedEntityId: z.string().max(100).optional(),
})

export const v1ListQuerySchema = z.object({
  from: isoWithTz.optional(),
  to: isoWithTz.optional(),
  moduleKey: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
  includeCancelled: z.enum(['true', 'false']).optional().default('false'),
})

export type V1CreateEventInput = z.infer<typeof v1CreateEventSchema>
export type V1UpdateEventInput = z.infer<typeof v1UpdateEventSchema>
export type V1ListQueryInput = z.infer<typeof v1ListQuerySchema>

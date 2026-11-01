import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, requireAuth, requireAdmin } from '@/lib/auth'
import { createServiceKey } from '@/lib/service-keys'
import { z } from 'zod'

export const dynamic = 'force-dynamic';

// `moduleName` must match the v1 `X-Module-Key` values (MODULE_KEY_MAP in
// src/lib/v1/auth.ts) so a key created here can actually authenticate against
// /api/v1. Legacy uppercase service names are kept for backward compatibility.
const createKeySchema = z.object({
  name: z.string().min(1),
  moduleName: z.enum([
    // v1 module keys (these authenticate against /api/v1/calendar/*)
    'global-calendar',
    'room-info',
    'finance',
    'hms',
    'rnd',
    'student-welfare',
    'academic-affairs',
    // legacy service names
    'IWD',
    'FINANCE',
    'RND',
    'HMS',
    'ROOM_INFO',
    'ADMIN',
  ]),
  permissions: z.object({
    canCreate: z.boolean(),
    canRead: z.boolean(),
    canUpdate: z.boolean(),
    canDelete: z.boolean(),
    allowedModules: z.array(z.string()),
  }).optional().default({
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    allowedModules: [],
  }),
})

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(await getAuthUser(request))
    requireAdmin(user)

    const keys = await prisma.serviceKey.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        moduleName: true,
        keyPrefix: true,
        permissions: true,
        isActive: true,
        lastUsed: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      keys: keys.map((k) => ({ ...k, id: k.id.toString() })),
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.startsWith('Forbidden')) {
      return NextResponse.json({ success: false, message: error.message }, { status: 403 })
    }
    console.error('GET /api/admin/service-keys error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(await getAuthUser(request))
    requireAdmin(user)

    const body = await request.json()
    const validated = createKeySchema.parse(body)

    const { key, serviceKey } = await createServiceKey(
      validated.name,
      validated.moduleName,
      validated.permissions,
      user.id
    )

    return NextResponse.json({
      success: true,
      key,
      serviceKey: { ...serviceKey, id: serviceKey.id.toString() },
      message: 'Service key created. Save the key now - it will not be shown again.',
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.issues }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.startsWith('Forbidden')) {
      return NextResponse.json({ success: false, message: error.message }, { status: 403 })
    }
    console.error('POST /api/admin/service-keys error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

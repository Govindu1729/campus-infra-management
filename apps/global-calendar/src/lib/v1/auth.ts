import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// Module key → sourceModule mapping (string-based, extensible)
export const MODULE_KEY_MAP: Record<string, string> = {
  'global-calendar': 'GLOBAL',
  'room-info': 'INFRASTRUCTURE',
  'finance': 'GLOBAL',
  'hms': 'GLOBAL',
  'rnd': 'RESEARCH_ADVANCEMENT',
  'student-welfare': 'STUDENT_WELFARE',
  'academic-affairs': 'ACADEMIC_AFFAIRS',
}

// Dev token: in production, hash + store in `service_keys` table
const MODULE_TOKEN = process.env.SUPERAPP_MODULE_TOKEN || 'dev-module-token-change-in-prod'

export interface V1Caller {
  type: 'module' | 'human'
  moduleKey?: string
  sourceModule?: string
  userId?: number
  isAdmin?: boolean
  permissions?: string[]
}

export async function getV1Caller(req: NextRequest): Promise<V1Caller | null> {
  // 1. Module auth (service-to-service)
  const moduleKey = req.headers.get('x-module-key')
  const moduleToken = req.headers.get('x-module-token')
  if (moduleKey && moduleToken) {
    if (moduleToken !== MODULE_TOKEN) return null
    const sourceModule = MODULE_KEY_MAP[moduleKey]
    if (!sourceModule) return null
    return { type: 'module', moduleKey, sourceModule }
  }

  // 2. Human auth (cookie-based session)
  const user = await getAuthUser(req)
  if (user) {
    const perms = await prisma.userModulePermission.findMany({
      where: { userId: user.id, canEdit: true },
      select: { moduleName: true },
    })
    return {
      type: 'human',
      userId: user.id,
      isAdmin: user.isAdmin,
      permissions: perms.map(p => p.moduleName),
    }
  }

  return null
}

export function canWrite(caller: V1Caller, sourceModule: string): boolean {
  if (caller.type === 'module') return caller.sourceModule === sourceModule
  if (caller.isAdmin) return true
  return (caller.permissions ?? []).includes(sourceModule)
}

export function canRead(caller: V1Caller, sourceModule: string, visibility: string): boolean {
  if (visibility === 'PUBLIC') return true
  if (caller.type === 'module') return caller.sourceModule === sourceModule || visibility !== 'ADMIN_ONLY'
  if (caller.isAdmin) return true
  if (visibility === 'ADMIN_ONLY') return false
  return (caller.permissions ?? []).includes(sourceModule)
}

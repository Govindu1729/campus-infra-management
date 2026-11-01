import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { authorizeV1ServiceKey } from '@/lib/service-keys'

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

// Module authentication is backed by the `service_keys` table (hashed, per-module,
// revocable). There is intentionally NO hard-coded fallback token: if a module has
// no active service key, module auth fails closed with 401.

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
    const sourceModule = MODULE_KEY_MAP[moduleKey]
    if (!sourceModule) return null

    // Timing-safe verification against the hashed service key for this module.
    // Fails closed (null -> 401) when the key is missing, inactive, or mismatched.
    const authorized = await authorizeV1ServiceKey(moduleKey, moduleToken)
    if (!authorized) return null

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

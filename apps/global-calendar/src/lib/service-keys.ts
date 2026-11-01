import { randomBytes, createHash, timingSafeEqual } from 'crypto'
import { prisma } from './prisma'
import { hashPassword, verifyPassword } from './password'

export interface ServiceKeyData {
  id: number
  name: string
  moduleName: string
  permissions: any
  isActive: boolean
  lastUsed: Date | null
}

export function generateAPIKey(): { key: string; hash: string; prefix: string } {
  const key = `sk_${randomBytes(32).toString('hex')}`
  const hash = hashServiceToken(key)
  const prefix = key.substring(0, 12)
  return { key, hash, prefix }
}

export async function validateServiceKey(key: string): Promise<ServiceKeyData | null> {
  const hash = createHash('sha256').update(key).digest('hex')
  
  const serviceKey = await prisma.serviceKey.findUnique({
    where: { keyHash: hash, isActive: true },
  })

  if (!serviceKey) return null

  // Update last used timestamp
  await prisma.serviceKey.update({
    where: { id: serviceKey.id },
    data: { lastUsed: new Date() },
  })

  return {
    id: serviceKey.id,
    name: serviceKey.name,
    moduleName: serviceKey.moduleName,
    permissions: serviceKey.permissions,
    isActive: serviceKey.isActive,
    lastUsed: serviceKey.lastUsed,
  }
}

/**
 * Hash a service token using the shared scrypt format (`scrypt:<salt>:<hash>`).
 * Used when creating/rotating service keys.
 */
export function hashServiceToken(token: string): string {
  return hashPassword(token)
}

/**
 * Constant-time verification of a presented token against a stored key hash.
 *
 * Supports two stored formats, so legacy keys keep working:
 *   - `scrypt:<salt>:<hash>`  -> verified with `verifyPassword` (timing-safe, salt-aware)
 *   - 64-char sha256 hex      -> verified with `crypto.timingSafeEqual`
 *
 * Never uses `===` on secret material.
 */
export function verifyServiceToken(token: string, storedHash: string): boolean {
  if (!token || !storedHash) return false

  if (storedHash.startsWith('scrypt:')) {
    return verifyPassword(token, storedHash)
  }

  // Legacy sha256 hash (hex)
  const provided = createHash('sha256').update(token).digest()
  const expected = Buffer.from(storedHash, 'hex')
  if (expected.length === 0 || provided.length !== expected.length) return false
  return timingSafeEqual(provided, expected)
}

/**
 * Authorize an incoming v1 module request.
 *
 * Fails closed: no token, no candidate key, inactive key, or a mismatch all
 * return `null`. On success, bumps `lastUsed`.
 */
export async function authorizeV1ServiceKey(
  moduleName: string,
  token: string
): Promise<{ id: number; moduleName: string } | null> {
  if (!moduleName || !token) return null

  const candidates = await prisma.serviceKey.findMany({
    where: { moduleName, isActive: true },
    select: { id: true, moduleName: true, keyHash: true },
  })

  const match = candidates.find((k) => verifyServiceToken(token, k.keyHash))
  if (!match) return null

  await prisma.serviceKey.update({
    where: { id: match.id },
    data: { lastUsed: new Date() },
  })

  return { id: match.id, moduleName: match.moduleName }
}

export async function createServiceKey(
  name: string,
  moduleName: string,
  permissions: any,
  createdBy: number
): Promise<{ key: string; serviceKey: ServiceKeyData }> {
  const { key, hash, prefix } = generateAPIKey()

  const serviceKey = await prisma.serviceKey.create({
    data: {
      name,
      moduleName,
      keyHash: hash,
      keyPrefix: prefix,
      permissions,
      createdBy,
    },
  })

  return {
    key,
    serviceKey: {
      id: serviceKey.id,
      name: serviceKey.name,
      moduleName: serviceKey.moduleName,
      permissions: serviceKey.permissions,
      isActive: serviceKey.isActive,
      lastUsed: serviceKey.lastUsed,
    },
  }
}

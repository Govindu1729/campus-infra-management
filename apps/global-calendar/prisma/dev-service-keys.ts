/**
 * Dev service-key seed (idempotent).
 *
 * MISSION-BRIEF-002 — v1 module auth now reads hashed keys from `service_keys`
 * (no static shared-token fallback). This seed mints DEV keys so local/Phase-2
 * testing keeps working.
 *
 * NOTE: intentionally self-contained (no `src/` imports) because it runs inside
 * the `migrate` container (Dockerfile `prisma` stage) which only has `prisma/`.
 *
 * In production, keys are minted via `POST /api/admin/service-keys`; this seed
 * is for dev environments only.
 */
import { PrismaClient } from '@prisma/client'
import { scryptSync, randomBytes } from 'node:crypto'

const prisma = new PrismaClient()

// Keep in sync with `src/lib/password.ts#hashPassword` (scrypt:<salt>:<hash>).
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `scrypt:${salt}:${hash}`
}

const DEV_TOKEN = process.env.SUPERAPP_MODULE_TOKEN || 'dev-module-token-change-in-prod'

// `global-calendar` is required for v1 testing.
// `rnd` is seeded so Phase-1 cross-module ownership tests can still authenticate
// as a *different* module and be correctly rejected with 403 (not 401).
const DEV_KEYS: Array<{ moduleName: string; name: string }> = [
  { moduleName: 'global-calendar', name: 'Dev Service Key — Global Calendar' },
  { moduleName: 'rnd', name: 'Dev Service Key — R&D (cross-module tests)' },
]

async function main() {
  for (const k of DEV_KEYS) {
    const existing = await prisma.serviceKey.findFirst({
      where: { moduleName: k.moduleName, isActive: true },
      select: { id: true, keyPrefix: true },
    })

    if (existing) {
      console.log(`↷ ${k.moduleName}: active key already present (id=${existing.id}) — skipping`)
      continue
    }

    const created = await prisma.serviceKey.create({
      data: {
        name: k.name,
        moduleName: k.moduleName,
        keyHash: hashPassword(DEV_TOKEN),
        keyPrefix: DEV_TOKEN.substring(0, 12),
        permissions: {},
        isActive: true,
        createdBy: 1,
      },
      select: { id: true, moduleName: true, keyPrefix: true },
    })

    console.log(`✅ ${created.moduleName}: seeded dev service key (id=${created.id}, prefix=${created.keyPrefix})`)
  }
}

main()
  .catch((e) => {
    console.error('❌ dev-service-keys seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

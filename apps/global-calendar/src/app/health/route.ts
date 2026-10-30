import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const started = Date.now()
  let dbStatus: 'ok' | 'error' = 'ok'
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch {
    dbStatus = 'error'
  }
  const status = dbStatus === 'ok' ? 'ok' : 'degraded'
  return NextResponse.json({
    status,
    service: 'global-calendar-v1',
    timestamp: new Date().toISOString(),
    db: dbStatus,
    latencyMs: Date.now() - started,
  }, { status: status === 'ok' ? 200 : 503 })
}

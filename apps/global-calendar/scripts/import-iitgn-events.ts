import { PrismaClient, EventType } from '@prisma/client'

const prisma = new PrismaClient()

const CATEGORY_MAP: Record<string, string> = {
  conference: 'RESEARCH_ADVANCEMENT',
  workshop: 'ACADEMIC_AFFAIRS',
  seminar: 'RESEARCH_ADVANCEMENT',
  talk: 'RESEARCH_ADVANCEMENT',
  cultural: 'STUDENT_WELFARE',
  deadline: 'ACADEMIC_AFFAIRS',
  visit: 'INSTITUTE_EVENTS',
  session: 'INSTITUTE_EVENTS',
  other: 'GLOBAL',
}

const EVENT_TYPE_MAP: Record<string, string> = {
  conference: 'MILESTONE',
  workshop: 'TASK',
  seminar: 'MEETING',
  talk: 'MEETING',
  cultural: 'MEETING',
  deadline: 'DEADLINE',
  visit: 'MEETING',
  session: 'MEETING',
  other: 'REMINDER',
}

interface IITGNEvent {
  id: string
  title: string
  start: string
  end: string
  venue: string | null
  url: string | null
  summary: string
  category: string
  catLabel: string
}

// Very aggressive truncation - 191 chars is Prisma's MySQL default
function truncateDescription(text: string | null, maxLen = 191): string | null {
  if (!text) return null
  const trimmed = text.trim()
  if (trimmed.length <= maxLen) return trimmed
  return trimmed.slice(0, maxLen - 3) + '...'
}

async function main() {
  console.log('🔄 Fetching events from events.iitgn.ac.in...')

  const res = await fetch('https://events.iitgn.ac.in/home/')
  const html = await res.text()

  const match = html.match(/<script type="application\/json" id="calData">([\s\S]*?)<\/script>/)
  if (!match) {
    console.error('❌ Could not find calData script tag')
    process.exit(1)
  }

  const parsed = JSON.parse(match[1])
  
  let events: IITGNEvent[]
  if (Array.isArray(parsed)) {
    events = parsed
  } else if (parsed && Array.isArray(parsed.events)) {
    events = parsed.events
  } else {
    console.error('❌ Unexpected JSON structure:', typeof parsed)
    process.exit(1)
  }
  
  console.log(`📊 Found ${events.length} events on IITGN site`)

  const admin = await prisma.user.findUnique({ where: { email: 'dean.campus@iitgn.ac.in' } })
  if (!admin) {
    console.error('❌ Admin user not found')
    process.exit(1)
  }
  console.log(`✅ Using admin user: ${admin.email}`)

  let imported = 0
  let skipped = 0
  const deptCounts: Record<string, number> = {}

  for (const ev of events) {
    const existing = await prisma.calendarEvent.findFirst({
      where: { title: ev.title, startTime: new Date(ev.start) },
    })

    if (existing) {
      skipped++
      continue
    }

    const sourceModule = CATEGORY_MAP[ev.category] || 'GLOBAL'
    const eventType = EVENT_TYPE_MAP[ev.category] || 'MEETING'

    const startTime = new Date(ev.start)
    const endTime = new Date(ev.end || ev.start)
    if (ev.start === ev.end || !ev.end) {
      endTime.setHours(23, 59, 59, 999)
    }

    const description = truncateDescription(ev.summary)

    await prisma.calendarEvent.create({
      data: {
        title: ev.title.slice(0, 255),
        description,
        startTime,
        endTime,
        isAllDay: ev.start === ev.end || !ev.end,
        sourceModule,
        eventType: (eventType as string).toUpperCase() as EventType,
        visibility: 'PUBLIC',
        metadata: {
          location: ev.venue || null,
          url: ev.url || null,
          originalCategory: ev.category,
          importedFrom: 'events.iitgn.ac.in',
          originalId: ev.id,
        },
        createdBy: admin.id,
      },
    })

    deptCounts[sourceModule] = (deptCounts[sourceModule] || 0) + 1
    imported++
  }

  console.log(`\n✅ Import complete: ${imported} imported, ${skipped} skipped`)
  console.log('\n📊 Events by department:')
  Object.entries(deptCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([dept, count]) => console.log(`  ${dept}: ${count}`))
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

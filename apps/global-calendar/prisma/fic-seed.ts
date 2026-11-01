import { PrismaClient } from '@prisma/client'
import { scryptSync, randomBytes } from 'node:crypto'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { ficContacts, centreCoordinators } from './fic-seed-data'

const prisma = new PrismaClient()

// Must match src/lib/password.ts exactly
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `scrypt:${salt}:${hash}`
}

// Deterministic password from email: Iitgn@<lastpart-of-email>
// e.g. counseling@iitgn.ac.in -> Iitgn@counseling
function passwordForEmail(email: string): string {
  const handle = email.split('@')[0].replace(/[^a-z0-9]/gi, '')
  return `Iitgn@${handle}`
}

const categories = [
  { name: 'ACADEMIC', description: 'Academic Affairs, HoDs, Discipline Coordinators, Curriculum' },
  { name: 'STUDENT_WELFARE', description: 'Student Affairs, Counseling, Sports, Wellbeing, CDS' },
  { name: 'INFRASTRUCTURE', description: 'CIF, ISTF, Housing, Campus Safety, Facilities' },
  { name: 'RESEARCH_ADVANCEMENT', description: 'Research, Industry Connect, Alumni, External Relations' },
]

async function main() {
  console.log('🏫 Seeding Functional Categories...')
  const categoryMap: Record<string, number> = {}
  for (const cat of categories) {
    const created = await prisma.functionalCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    })
    categoryMap[cat.name] = created.id
    console.log(`  ✅ ${cat.name} (id: ${created.id})`)
  }

  const allContacts = [...ficContacts, ...centreCoordinators]
  const credentialRows: string[] = []
  credentialRows.push('Role,Functional Category,Login Email,Password,System Role')

  console.log('\n📧 Seeding FIC Contacts + User Accounts...')

  // First pass: create contacts + user accounts
  for (const contact of allContacts) {
    const password = passwordForEmail(contact.primaryEmail)

    // Upsert FIC contact
    await prisma.ficContact.upsert({
      where: { primaryEmail: contact.primaryEmail },
      update: {
        officialTitle: contact.officialTitle,
        systemRole: contact.systemRole,
        functionalCategoryId: categoryMap[contact.category],
      },
      create: {
        name: contact.officialTitle,
        officialTitle: contact.officialTitle,
        primaryEmail: contact.primaryEmail,
        secondaryEmail: contact.secondaryEmail || null,
        systemRole: contact.systemRole,
        functionalCategoryId: categoryMap[contact.category],
      },
    })

    // Upsert User account (so they can actually log in)
    await prisma.user.upsert({
      where: { email: contact.primaryEmail },
      update: { passwordHash: hashPassword(password) },
      create: {
        email: contact.primaryEmail,
        name: contact.officialTitle, // Using title as name (names excluded per mentor demo)
        positionTitle: contact.officialTitle,
        passwordHash: hashPassword(password),
        isSystemAdmin: contact.systemRole === 'SUPER_ADMIN',
      },
    })

    // Grant module permission
    const user = await prisma.user.findUnique({ where: { email: contact.primaryEmail } })
    if (user) {
      await prisma.userModulePermission.upsert({
        where: { userId_moduleName: { userId: user.id, moduleName: 'GLOBAL' } },
        update: {},
        create: {
          userId: user.id,
          moduleName: 'GLOBAL',
          canView: true,
          canEdit: ['SUPER_ADMIN', 'DEAN_ADMIN', 'COMMITTEE_CHAIR', 'FIC_COORDINATOR', 'HOD'].includes(contact.systemRole),
          grantedBy: user.id,
        },
      })
    }

    credentialRows.push(`"${contact.officialTitle}",${contact.category},${contact.primaryEmail},${password},${contact.systemRole}`)
  }

  // Second pass: link secondary -> parent contacts
  let linked = 0
  for (const contact of allContacts) {
    if (contact.parentTitle) {
      const parent = await prisma.ficContact.findFirst({ where: { officialTitle: contact.parentTitle } })
      const child = await prisma.ficContact.findFirst({ where: { officialTitle: contact.officialTitle } })
      if (parent && child) {
        await prisma.ficContact.update({ where: { id: child.id }, data: { parentContactId: parent.id } })
        linked++
      }
    }
  }

  // Write credentials sheet
  const outPath = path.join(__dirname, '..', 'FIC_CREDENTIALS.csv')
  fs.writeFileSync(outPath, credentialRows.join('\n'))
  console.log(`\n📄 Credentials sheet written to: ${outPath}`)

  const total = await prisma.ficContact.count()
  const totalUsers = await prisma.user.count()
  console.log(`\n📊 Summary: ${total} FIC contacts, ${totalUsers} total user accounts, ${linked} secondary links`)
  console.log('✅ FIC seeding + credential generation completed!')
}

main()
  .catch((e) => { console.error('❌ FIC seeding failed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

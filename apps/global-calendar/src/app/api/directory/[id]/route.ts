import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 })
    }

    const contact = await prisma.ficContact.findUnique({
      where: { id },
      include: {
        functionalCategory: true,
        parentContact: { select: { officialTitle: true, primaryEmail: true } },
        childrenContacts: { select: { officialTitle: true, primaryEmail: true } },
      },
    })

    if (!contact) {
      return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: contact })
  } catch (error) {
    console.error('FIC profile fetch error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 })
  }
}

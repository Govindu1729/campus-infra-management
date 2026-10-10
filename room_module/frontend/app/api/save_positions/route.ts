import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Auth check – only admins can save layouts
    const cookieStore = await cookies();
    const session = cookieStore.get('iitgn_session');
    if (!session?.value) {
      return NextResponse.json({ error: 'You must be logged in as admin to save layouts' }, { status: 401 });
    }
    const data = JSON.parse(session.value);
    if (data.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can save layouts' }, { status: 403 });
    }

    const { building, floor, positions } = await request.json();

    // File path: e.g., public/layouts/AB3_Ground_Floor.json
    const dirPath = path.join(process.cwd(), 'public', 'layouts');
    const filePath = path.join(dirPath, `${building}_${floor.replace(/\s+/g, '_')}.json`);

    // Ensure directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Save the positions
    fs.writeFileSync(filePath, JSON.stringify(positions, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save positions' }, { status: 500 });
  }
}

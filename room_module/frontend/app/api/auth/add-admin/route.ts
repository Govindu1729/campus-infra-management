import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { addAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('iitgn_session');
    if (!session?.value) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }
    const data = JSON.parse(session.value);
    if (data.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can add other admins' }, { status: 403 });
    }

    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const result = addAdmin(username, password);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Admin "${username}" created` });
  } catch {
    return NextResponse.json({ error: 'Failed to add admin' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('iitgn_session');
    if (!session?.value) {
      return NextResponse.json({ user: null });
    }
    const data = JSON.parse(session.value);
    return NextResponse.json({ user: { username: data.username, role: data.role } });
  } catch {
    return NextResponse.json({ user: null });
  }
}

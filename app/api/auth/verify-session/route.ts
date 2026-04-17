import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';

export async function GET(req: Request) {
  try {
    const user = await requireAuth(req);
    return NextResponse.json({ ok: true, uid: user.uid, role: user.role });
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req);
    const userSnap = await adminDb.collection('users').doc(auth.uid).get();
    const token = userSnap.data()?.github?.accessToken;
    if (!token) return NextResponse.json({ repos: [] });

    const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const repos = await res.json();
    return NextResponse.json({ repos });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

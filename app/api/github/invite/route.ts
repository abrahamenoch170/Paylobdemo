import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/server/auth';
import { adminDb } from '@/lib/firebase-admin';

const schema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  username: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const userSnap = await adminDb.collection('users').doc(auth.uid).get();
    const token = userSnap.data()?.github?.accessToken;
    if (!token) return NextResponse.json({ error: 'GitHub not connected' }, { status: 400 });

    const { owner, repo, username } = parsed.data;
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/collaborators/${username}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ permission: 'push' }),
    });

    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({ error: txt || 'Invite failed' }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

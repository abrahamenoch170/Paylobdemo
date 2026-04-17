import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { createProjectSchema } from '@/lib/validation/api';
import { requireAuth, requireRole } from '@/lib/server/auth';
import { getClientIp, rateLimit } from '@/lib/server/rate-limit';

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    requireRole(auth, ['client', 'admin']);

    const ip = getClientIp(req);
    const limited = rateLimit({ key: `create-project:${ip}:${auth.uid}`, max: 20, windowMs: 60_000 });
    if (!limited.success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { projectData } = parsed.data;
    if (projectData.clientId !== auth.uid && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const docRef = await adminDb.collection('projects').add(projectData);
    return NextResponse.json({ success: true, projectId: docRef.id });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "UNKNOWN";
    if (errorMessage === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (errorMessage === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

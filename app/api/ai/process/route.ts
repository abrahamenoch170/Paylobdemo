import { NextResponse } from 'next/server';
import { loadAllSkills } from '@/lib/skills/loader';
import { adminDb } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/server/auth';
import { aiProcessSchema } from '@/lib/validation/api';
import { getClientIp, rateLimit } from '@/lib/server/rate-limit';

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);

    const ip = getClientIp(req);
    const limited = rateLimit({ key: `ai:${ip}:${auth.uid}`, max: 20, windowMs: 60_000 });
    if (!limited.success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    const body = await req.json();
    const parsed = aiProcessSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { projectId, messages, context } = parsed.data;

    const projectSnap = await adminDb.collection('projects').doc(projectId).get();
    if (!projectSnap.exists) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    const project = projectSnap.data() as { clientId: string; freelancerId: string };

    const isParticipant = project.clientId === auth.uid || project.freelancerId === auth.uid || auth.role === 'admin';
    if (!isParticipant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    if (context?.projectId && context.projectId !== projectId) {
      return NextResponse.json({ error: 'Invalid context' }, { status: 400 });
    }

    const skills = await loadAllSkills();

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.APP_URL || 'https://paylob.xyz',
        'X-Title': 'Paylob',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b:free',
        messages,
        tools: skills.map((s) => ({
          type: 'function',
          function: { name: s.name, description: s.description, parameters: s.parameters },
        })),
      }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "UNKNOWN";
    if (errorMessage === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}

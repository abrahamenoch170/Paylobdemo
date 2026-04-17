import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { loadAllSkills } from '@/lib/skills/loader';
import { requireAuth } from '@/lib/server-auth';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit';

const aiRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant', 'tool']),
      content: z.string().min(1).max(8000),
    }),
  ).min(1),
  context: z.unknown().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const rateKey = getRateLimitKey(user.uid, 'api:ai:process');
    const rateResult = checkRateLimit(rateKey, 20, 60_000);

    if (!rateResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { messages } = aiRequestSchema.parse(await req.json());
    const skills = await loadAllSkills();

    async function callOpenRouter(model: string) {
      return fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.APP_URL ?? 'https://paylob.xyz',
          'X-Title': 'Paylob',
        },
        body: JSON.stringify({
          model,
          messages,
          tools: skills.map((s) => ({
            type: 'function',
            function: { name: s.name, description: s.description, parameters: s.parameters },
          })),
        }),
      });
    }

    let response = await callOpenRouter(process.env.OPENROUTER_MODEL ?? 'nvidia/nemotron-3-super-120b:free');
    if (!response.ok) {
      response = await callOpenRouter('openrouter/free');
    }

    if (!response.ok) {
      console.error('AI provider error:', await response.text());
      return NextResponse.json({ error: 'AI processing failed' }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request payload', details: error.flatten() }, { status: 400 });
    }

    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('AI route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/server-auth';

const documentsSchema = z.object({
  action: z.enum(['compress', 'merge', 'thumbnail']),
  fileIds: z.array(z.string().min(1)).optional(),
});

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req);
    const payload = documentsSchema.parse(await req.json());
    return NextResponse.json({ status: 'ok', action: payload.action });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request payload', details: error.flatten() }, { status: 400 });
    }

    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Documents route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

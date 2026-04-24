import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { requireAuth } from '@/lib/server-auth';

const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  html: z.string().min(1).max(50_000),
});

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req);
    const payload = emailSchema.parse(await req.json());
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Paylob <hello@paylob.xyz>',
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request payload', details: error.flatten() }, { status: 400 });
    }

    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Send email route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

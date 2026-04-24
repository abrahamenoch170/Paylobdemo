import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { requireAuth } from '@/lib/server-auth';

const notificationSchema = z.object({
  type: z.enum(['contract_sent']),
  email: z.string().email(),
  data: z.object({
    projectName: z.string().min(1).max(200),
  }),
});

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req);
    const { type, email, data } = notificationSchema.parse(await req.json());
    const resend = new Resend(process.env.RESEND_API_KEY);

    let subject = '';
    let html = '';

    if (type === 'contract_sent') {
      subject = 'A new contract awaits your signature';
      html = `<p>Hello, please sign the contract for project ${data.projectName}.</p>`;
    }

    await resend.emails.send({
      from: 'Paylob <hello@paylob.xyz>',
      to: email,
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request payload', details: error.flatten() }, { status: 400 });
    }

    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Notification route error:', error);
    return NextResponse.json({ error: 'Email failed' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { notificationSchema } from '@/lib/validation/api';
import { requireAuth } from '@/lib/server/auth';
import { getClientIp, rateLimit } from '@/lib/server/rate-limit';

const escapeHtml = (v: string) =>
  v.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

export async function POST(req: Request) {
  try {
    await requireAuth(req);

    const ip = getClientIp(req);
    const limited = rateLimit({ key: `notifications:${ip}`, max: 20, windowMs: 60_000 });
    if (!limited.success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    const body = await req.json();
    const parsed = notificationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { type, email, data } = parsed.data;

    let subject = '';
    let html = '';

    if (type === 'contract_sent') {
      subject = 'A new contract awaits your signature';
      html = `<p>Hello, please sign the contract for project ${escapeHtml(data.projectName)}.</p>`;
    }

    const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');
    await resend.emails.send({
      from: 'Paylob <hello@paylob.xyz>',
      to: email,
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "UNKNOWN";
    if (errorMessage === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Email failed' }, { status: 500 });
  }
}

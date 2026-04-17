import crypto from 'crypto';
import { NextResponse } from 'next/server';

function verifyGithubSignature(signature: string | null, payload: string): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret || !signature) {
    return false;
  }

  const expected = `sha256=${crypto.createHmac('sha256', secret).update(payload).digest('hex')}`;
  if (signature.length !== expected.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-hub-signature-256');
    const eventType = req.headers.get('x-github-event');
    const rawPayload = await req.text();

    if (!verifyGithubSignature(signature, rawPayload)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = JSON.parse(rawPayload);

    if (eventType === 'push') {
      console.log('Received verified push to ref:', payload.ref);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('GitHub webhook error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

import crypto from 'crypto';

function verifyGithubSignature(rawBody: string, signature: string | null) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const expected = `sha256=${hmac}`;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-hub-signature-256');
    if (!verifyGithubSignature(rawBody, signature)) {
      return new Response('Unauthorized request', { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventAction = req.headers.get('x-github-event');

    if (eventAction === 'push') {
      console.log('Received push to ref:', payload.ref);
    }

    return new Response('Webhook Received', { status: 200 });
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }
}

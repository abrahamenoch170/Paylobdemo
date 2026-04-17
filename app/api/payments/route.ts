import { NextResponse } from 'next/server';
import { paymentsRouteSchema } from '@/lib/validation/api';
import { requireAuth, requireRole } from '@/lib/server/auth';
import { getClientIp, rateLimit } from '@/lib/server/rate-limit';

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    requireRole(auth, ['freelancer', 'admin']);

    const ip = getClientIp(req);
    const limited = rateLimit({ key: `payments-route:${ip}:${auth.uid}`, max: 20, windowMs: 60_000 });
    if (!limited.success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    const body = await req.json();
    const parsed = paymentsRouteSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { provider, data } = parsed.data;

    if (provider === 'flutterwave') {
      const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return NextResponse.json(await response.json(), { status: response.status });
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "UNKNOWN";
    if (errorMessage === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (errorMessage === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Failed to process payment request' }, { status: 500 });
  }
}

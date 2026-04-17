import { NextResponse } from 'next/server';
import { flutterwave } from '@/lib/payment/flutterwave';
import { paystack } from '@/lib/payment/paystack';
import { requireAuth } from '@/lib/server/auth';
import { getClientIp, rateLimit } from '@/lib/server/rate-limit';

export async function GET(req: Request) {
  try {
    await requireAuth(req);

    const ip = getClientIp(req);
    const limited = rateLimit({ key: `pay-verify:${ip}`, max: 50, windowMs: 60_000 });
    if (!limited.success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    const { searchParams } = new URL(req.url);
    const provider = searchParams.get('provider');
    const reference = searchParams.get('reference');
    const transaction_id = searchParams.get('transaction_id');

    if (!provider || (!reference && !transaction_id)) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    let result;
    if (provider === 'flutterwave') {
      result = await flutterwave.verifyTransaction(transaction_id || reference!);
    } else {
      result = await paystack.verifyTransaction(reference!);
    }

    if (result.status === 'success' || (provider === 'paystack' && result.status)) {
      return NextResponse.json({ status: 'success', data: result });
    }

    return NextResponse.json({ status: 'failed', data: result });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "UNKNOWN";
    if (errorMessage === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}

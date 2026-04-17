import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/server-auth';
import { adminDb } from '@/lib/firebase-admin';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit';

const withdrawalSchema = z.object({
  provider: z.enum(['flutterwave', 'paystack']),
  amount: z.number().positive(),
  accountNumber: z.string().min(6).max(32),
  bankCode: z.string().min(2).max(20),
  currency: z.string().length(3).default('USD'),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const rateKey = getRateLimitKey(user.uid, 'api:payments:withdraw');
    const rateResult = checkRateLimit(rateKey, 10, 60_000);

    if (!rateResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const payload = withdrawalSchema.parse(await req.json());

    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userRole = userDoc.data()?.role;
    if (userRole !== 'freelancer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (payload.provider === 'flutterwave') {
      const response = await fetch('https://api.flutterwave.com/v3/transfers', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_bank: payload.bankCode,
          account_number: payload.accountNumber,
          amount: payload.amount,
          currency: payload.currency,
          narration: `Payout for ${user.uid}`,
          reference: `${user.uid}-${Date.now()}`,
        }),
      });

      if (!response.ok) {
        console.error('Flutterwave payout failed:', await response.text());
        return NextResponse.json({ error: 'Payment provider request failed' }, { status: 502 });
      }

      return NextResponse.json(await response.json());
    }

    const response = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'balance',
        reason: `Payout for ${user.uid}`,
        amount: Math.round(payload.amount * 100),
        recipient: payload.accountNumber,
      }),
    });

    if (!response.ok) {
      console.error('Paystack payout failed:', await response.text());
      return NextResponse.json({ error: 'Payment provider request failed' }, { status: 502 });
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request payload', details: error.flatten() }, { status: 400 });
    }

    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Payment route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

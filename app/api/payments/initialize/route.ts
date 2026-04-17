import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { flutterwave } from '@/lib/payment/flutterwave';
import { paystack } from '@/lib/payment/paystack';
import { adminDb } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/server-auth';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit';

const initializeSchema = z.object({
  milestoneId: z.string().min(1),
  provider: z.enum(['flutterwave', 'paystack']),
  amount: z.number().positive(),
  email: z.string().email(),
  name: z.string().max(120).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const rateKey = getRateLimitKey(user.uid, 'api:payments:initialize');
    const rateResult = checkRateLimit(rateKey, 20, 60_000);
    if (!rateResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { milestoneId, provider, amount, email, name } = initializeSchema.parse(await req.json());

    const milestoneSnap = await adminDb.collection('milestones').doc(milestoneId).get();
    if (!milestoneSnap.exists) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const milestone = milestoneSnap.data() as { clientId?: string };
    if (milestone.clientId && milestone.clientId !== user.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tx_ref = `${milestoneId}-${Date.now()}`;

    const response =
      provider === 'flutterwave'
        ? await flutterwave.initializeTransaction({
            tx_ref,
            amount,
            currency: 'USD',
            redirect_url: `${process.env.APP_URL}/pay/verify?provider=flutterwave`,
            customer: { email, name },
            meta: { milestoneId, userId: user.uid },
          })
        : await paystack.initializeTransaction({
            email,
            amount: Math.round(amount * 100),
            callback_url: `${process.env.APP_URL}/pay/verify?provider=paystack`,
            reference: tx_ref,
            metadata: { milestoneId, userId: user.uid },
          });

    return NextResponse.json({ status: 'success', data: response });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request payload', details: error.flatten() }, { status: 400 });
    }

    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Payment initialization failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

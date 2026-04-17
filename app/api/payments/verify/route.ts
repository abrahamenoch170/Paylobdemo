import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { flutterwave } from '@/lib/payment/flutterwave';
import { paystack } from '@/lib/payment/paystack';

const querySchema = z.object({
  provider: z.enum(['flutterwave', 'paystack']),
  reference: z.string().optional(),
  transaction_id: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.parse({
      provider: searchParams.get('provider'),
      reference: searchParams.get('reference') ?? undefined,
      transaction_id: searchParams.get('transaction_id') ?? undefined,
    });

    if (!parsed.reference && !parsed.transaction_id) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const result =
      parsed.provider === 'flutterwave'
        ? await flutterwave.verifyTransaction(parsed.transaction_id ?? parsed.reference!)
        : await paystack.verifyTransaction(parsed.reference!);

    if (result.status === 'success' || (parsed.provider === 'paystack' && result.status)) {
      return NextResponse.json({ status: 'success', data: result });
    }

    return NextResponse.json({ status: 'failed', data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request parameters', details: error.flatten() }, { status: 400 });
    }

    console.error('Payment verification failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { flutterwave } from '@/lib/payment/flutterwave';
import { paystack } from '@/lib/payment/paystack';

const webhookSchema = z.object({
  event: z.string().optional(),
  data: z
    .object({
      reference: z.string().optional(),
      tx_ref: z.string().optional(),
      status: z.string().optional(),
      amount: z.number().optional(),
      currency: z.string().optional(),
      customer: z.object({ email: z.string().email().optional() }).optional(),
      user: z.object({ email: z.string().email().optional() }).optional(),
    })
    .passthrough(),
});

export async function POST(req: Request) {
  try {
    const provider = req.headers.get('x-paystack-signature') ? 'paystack' : 'flutterwave';
    const signature = req.headers.get('verif-hash') || req.headers.get('x-paystack-signature');
    const rawBody = await req.text();

    if (!signature) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isValid =
      provider === 'paystack'
        ? paystack.verifyWebhook(signature, rawBody)
        : flutterwave.verifyWebhook(signature, JSON.parse(rawBody));

    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event, data } = webhookSchema.parse(JSON.parse(rawBody));

    const reference = data.reference || data.tx_ref;
    const isSuccessful = event === 'charge.success' || data.status === 'successful';

    if (isSuccessful && reference) {
      const milestoneId = reference.split('-')[0];
      const milestoneRef = adminDb.collection('milestones').doc(milestoneId);
      const milestoneSnap = await milestoneRef.get();

      if (milestoneSnap.exists) {
        await milestoneRef.update({
          state: 'AUTHORIZED',
          paymentRef: reference,
          updatedAt: new Date().toISOString(),
        });

        await adminDb.collection('payments').add({
          milestoneId,
          reference,
          provider,
          amount: data.amount,
          currency: data.currency,
          customerEmail: data.customer?.email || data.user?.email,
          status: 'SUCCESS',
          createdAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ status: 'ok', message: 'Webhook processed' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid webhook payload', details: error.flatten() }, { status: 400 });
    }

    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

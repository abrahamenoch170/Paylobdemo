import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { flutterwave } from '@/lib/payment/flutterwave';
import { paystack } from '@/lib/payment/paystack';

export async function POST(req: Request) {
  try {
    const provider = req.headers.get('x-paystack-signature') ? 'paystack' : 'flutterwave';
    const signature = req.headers.get('verif-hash') || req.headers.get('x-paystack-signature');
    const rawBody = await req.text();

    if (!signature) {
      return new Response('Missing signature', { status: 401 });
    }

    // Verify signature
    let isValid = false;
    if (provider === 'paystack') {
      isValid = paystack.verifyWebhook(signature, rawBody);
    } else {
      isValid = flutterwave.verifyWebhook(signature, JSON.parse(rawBody));
    }

    if (!isValid) {
      return new Response('Unauthorized request', { status: 401 });
    }

    const bodyData = JSON.parse(rawBody);
    const { event, data } = bodyData;

    const reference = data?.reference || data?.tx_ref;
    const isSuccessful = event === 'charge.success' || data?.status === 'successful';

    if (isSuccessful && reference) {
      const milestoneId = reference.split('-')[0];
      const milestoneRef = adminDb.collection('milestones').doc(milestoneId);
      const milestoneSnap = await milestoneRef.get();

      if (milestoneSnap.exists) {
        await milestoneRef.update({
          state: 'AUTHORIZED',
          paymentRef: reference,
          updatedAt: new Date()
        });

        await adminDb.collection('payments').add({
          milestoneId,
          reference,
          provider,
          amount: data.amount,
          currency: data.currency,
          customerEmail: data.customer?.email || data.user?.email,
          status: 'SUCCESS',
          createdAt: new Date()
        });
        
        console.log(`✅ Payment authorized for milestone ${milestoneId}`);
      }
    }

    return NextResponse.json({ status: 'ok', msg: 'payment webhook processed' });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}

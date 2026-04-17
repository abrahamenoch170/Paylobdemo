import { NextResponse } from 'next/server';
import { flutterwave } from '@/lib/payment/flutterwave';
import { paystack } from '@/lib/payment/paystack';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { milestoneId, provider, amount, email, name } = await req.json();

    if (!milestoneId || !provider || !amount || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const tx_ref = `${milestoneId}-${Date.now()}`;
    
    // Check if milestone exists
    const milestoneSnap = await adminDb.collection('milestones').doc(milestoneId).get();
    if (!milestoneSnap.exists) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    let response;
    if (provider === 'flutterwave') {
      response = await flutterwave.initializeTransaction({
        tx_ref,
        amount,
        currency: 'USD',
        redirect_url: `${process.env.APP_URL}/pay/verify?provider=flutterwave`,
        customer: { email, name },
        meta: { milestoneId }
      });
    } else {
      response = await paystack.initializeTransaction({
        email,
        amount: Math.round(amount * 100), // convert to kobo
        callback_url: `${process.env.APP_URL}/pay/verify?provider=paystack`,
        reference: tx_ref,
        metadata: { milestoneId }
      });
    }

    return NextResponse.json({ status: 'success', data: response });
  } catch (error: any) {
    console.error('Payment initialization failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

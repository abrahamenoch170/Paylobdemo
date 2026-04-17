import { NextResponse } from 'next/server';
import { flutterwave } from '@/lib/payment/flutterwave';
import { paystack } from '@/lib/payment/paystack';

export async function GET(req: Request) {
  try {
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
       // Webhook usually handles the state update, but we can do a sanity check here
       return NextResponse.json({ status: 'success', data: result });
    }

    return NextResponse.json({ status: 'failed', data: result });
  } catch (error: any) {
    console.error('Payment Verification failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

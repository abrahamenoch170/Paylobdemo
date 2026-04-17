import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

function getSecretKey() {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('Missing PAYSTACK_SECRET_KEY');
  }
  return PAYSTACK_SECRET_KEY;
}

export const paystack = {
  async initializeTransaction(payload: {
    email: string;
    amount: number;
    callback_url: string;
    reference: string;
    metadata?: Record<string, unknown>;
  }) {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to initialize Paystack transaction');
    }

    return response.json();
  },

  async verifyTransaction(reference: string) {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to verify Paystack transaction');
    }

    return response.json();
  },

  verifyWebhook(signature: string, rawBody: string) {
    const hash = crypto
      .createHmac('sha512', getSecretKey())
      .update(rawBody)
      .digest('hex');

    return signature === hash;
  },
};

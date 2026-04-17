import crypto from 'crypto';

const BASE_URL = 'https://api.paystack.co';

export const paystack = {
  async initializeTransaction(payload: Record<string, unknown>) {
    const res = await fetch(`${BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async verifyTransaction(reference: string) {
    const res = await fetch(`${BASE_URL}/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    return res.json();
  },

  verifyWebhook(signature: string, rawBody: string) {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) return false;
    const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
    return signature === hash;
  },
};

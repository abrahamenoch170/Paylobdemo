import crypto from 'crypto';

const BASE_URL = 'https://api.flutterwave.com/v3';

export const flutterwave = {
  async initializeTransaction(payload: Record<string, unknown>) {
    const res = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async verifyTransaction(idOrRef: string) {
    const res = await fetch(`${BASE_URL}/transactions/${idOrRef}/verify`, {
      headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` },
    });
    return res.json();
  },

  verifyWebhook(signature: string, body: Record<string, unknown>) {
    const secret = process.env.FLUTTERWAVE_WEBHOOK_HASH;
    if (!secret) return false;
    const payloadHash = crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
    return signature === secret || signature === payloadHash;
  },
};

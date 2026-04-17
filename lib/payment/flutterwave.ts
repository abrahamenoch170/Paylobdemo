const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FLUTTERWAVE_WEBHOOK_SECRET = process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH;

function getSecretKey() {
  if (!FLUTTERWAVE_SECRET_KEY) {
    throw new Error('Missing FLUTTERWAVE_SECRET_KEY');
  }
  return FLUTTERWAVE_SECRET_KEY;
}

export const flutterwave = {
  async initializeTransaction(payload: {
    tx_ref: string;
    amount: number;
    currency: string;
    redirect_url: string;
    customer: { email: string; name?: string };
    meta?: Record<string, unknown>;
  }) {
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to initialize Flutterwave transaction');
    }

    return response.json();
  },

  async verifyTransaction(transactionId: string) {
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to verify Flutterwave transaction');
    }

    return response.json();
  },

  verifyWebhook(signature: string, _body: unknown) {
    if (!FLUTTERWAVE_WEBHOOK_SECRET) {
      return false;
    }

    return signature === FLUTTERWAVE_WEBHOOK_SECRET;
  },
};

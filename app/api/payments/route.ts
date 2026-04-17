import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { provider, data, userRole } = await req.json();

  // Simple RBAC check
  if (userRole !== 'freelancer') {
    return NextResponse.json({ error: 'Unauthorized: Freelancer role required for withdrawal' }, { status: 403 });
  }

  // Payment processing logic
  if (provider === 'flutterwave') {
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return NextResponse.json(await response.json());
  } else if (provider === 'paystack') {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return NextResponse.json(await response.json());
  }
}

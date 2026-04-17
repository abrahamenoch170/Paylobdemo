import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { type, email, data } = await req.json();

  let subject = '';
  let html = '';

  switch (type) {
    case 'contract_sent':
      subject = 'A new contract awaits your signature';
      html = `<p>Hello, please sign the contract for project ${data.projectName}.</p>`;
      break;
    // Add other cases
  }

  try {
    await resend.emails.send({
      from: 'Paylob <hello@paylob.xyz>',
      to: email,
      subject,
      html
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Email failed' }, { status: 500 });
  }
}

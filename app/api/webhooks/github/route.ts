import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const eventAction = req.headers.get('x-github-event');
    const payload = await req.json();
    
    if (eventAction === 'push') {
      console.log('Received push to ref:', payload.ref);
      // Future logic: identify milestone tied to this repo branch and mark as code delivered
    }
    
    return new Response('Webhook Received', { status: 200 });
  } catch(e) {
    return new Response('Invalid JSON', { status: 400 });
  }
}

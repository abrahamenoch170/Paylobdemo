import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const [uid] = (state || '').split(':');

  if (!code || !uid) {
    return NextResponse.redirect(`${process.env.APP_URL || ''}/settings?github=error`);
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return NextResponse.redirect(`${process.env.APP_URL || ''}/settings?github=error`);
  }

  await adminDb.collection('users').doc(uid).set(
    {
      github: {
        connected: true,
        accessToken: tokenData.access_token,
      },
    },
    { merge: true }
  );

  return NextResponse.redirect(`${process.env.APP_URL || ''}/settings?github=connected`);
}

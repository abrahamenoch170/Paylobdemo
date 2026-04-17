import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req);
    const clientId = process.env.GITHUB_CLIENT_ID;
    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    if (!clientId) {
      return NextResponse.json({ error: 'GitHub client not configured' }, { status: 500 });
    }

    const redirectUri = `${appUrl}/api/github/oauth/callback`;
    const state = `${auth.uid}:${Date.now()}`;
    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('scope', 'repo read:user');
    url.searchParams.set('state', state);

    return NextResponse.json({ url: url.toString() });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

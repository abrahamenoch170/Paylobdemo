import { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export type AuthenticatedUser = {
  uid: string;
  email?: string;
};

export function getTokenFromRequest(req: NextRequest | Request): string | null {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  if ('cookies' in req && req.cookies) {
    return req.cookies.get('session')?.value ?? null;
  }

  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return null;

  const match = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('session='));

  return match ? decodeURIComponent(match.slice('session='.length)) : null;
}

export async function requireAuth(req: NextRequest | Request): Promise<AuthenticatedUser> {
  const token = getTokenFromRequest(req);
  if (!token) {
    throw new Error('UNAUTHORIZED');
  }

  const decoded = await adminAuth.verifyIdToken(token, true);
  return {
    uid: decoded.uid,
    email: decoded.email,
  };
}

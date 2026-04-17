import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PREFIXES = ['/', '/contract', '/pay', '/deliver', '/api/webhooks', '/api/auth/verify-session'];
const AUTH_PREFIXES = ['/auth'];

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/projects',
  '/contract',
  '/deliver',
  '/disputes',
  '/pay',
  '/freelancer',
  '/onboarding',
  '/role',
  '/api',
];

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  if (AUTH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const requiresAuth = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!requiresAuth) {
    return NextResponse.next();
  }

  const verifyUrl = `${origin}/api/auth/verify-session`;
  const verifyRes = await fetch(verifyUrl, {
    method: 'GET',
    headers: {
      cookie: req.headers.get('cookie') || '',
      authorization: req.headers.get('authorization') || '',
    },
    cache: 'no-store',
  });

  if (!verifyRes.ok) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

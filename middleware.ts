import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_PATHS = [
  '/api/webhooks/payment',
  '/api/webhooks/github',
  '/api/payments/verify',
];

function isPublicApiPath(pathname: string): boolean {
  return PUBLIC_API_PATHS.some((path) => pathname.startsWith(path));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api') || isPublicApiPath(pathname)) {
    return NextResponse.next();
  }

  const authorization = request.headers.get('authorization');
  const sessionCookie = request.cookies.get('session')?.value;

  if (!authorization?.startsWith('Bearer ') && !sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};

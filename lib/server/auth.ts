import { adminAuth, adminDb } from '@/lib/firebase-admin';

export type Role = 'client' | 'freelancer' | 'admin' | null;

export interface AuthContext {
  uid: string;
  email?: string;
  role: Role;
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [k, ...v] = part.trim().split('=');
    if (!k) return acc;
    acc[k] = decodeURIComponent(v.join('='));
    return acc;
  }, {});
}

export function getRequestToken(req: Request): string | null {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);

  const cookies = parseCookies(req.headers.get('cookie'));
  return cookies.firebaseIdToken || cookies.__session || null;
}

export async function requireAuth(req: Request): Promise<AuthContext> {
  const token = getRequestToken(req);
  if (!token) {
    throw new Error('UNAUTHORIZED');
  }

  const decoded = await adminAuth.verifyIdToken(token, true);
  const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
  const role = (userDoc.exists ? (userDoc.data()?.role as Role) : null) || null;

  return {
    uid: decoded.uid,
    email: decoded.email,
    role,
  };
}

export function requireRole(ctx: AuthContext, roles: Role[]) {
  if (!roles.includes(ctx.role)) {
    throw new Error('FORBIDDEN');
  }
}

const memoryStore = new Map<string, { count: number; resetAt: number }>();

interface LimitOptions {
  key: string;
  windowMs?: number;
  max?: number;
}

export function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export function rateLimit({ key, windowMs = 60_000, max = 60 }: LimitOptions) {
  const now = Date.now();
  const item = memoryStore.get(key);

  if (!item || item.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: max - 1 };
  }

  if (item.count >= max) {
    return { success: false, remaining: 0, resetAt: item.resetAt };
  }

  item.count += 1;
  memoryStore.set(key, item);
  return { success: true, remaining: max - item.count };
}

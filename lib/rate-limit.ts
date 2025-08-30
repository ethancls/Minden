type Bucket = { count: number; resetAt: number };

const globalStore = globalThis as unknown as {
  __rate_limit_store?: Map<string, Bucket>;
};

const store: Map<string, Bucket> = globalStore.__rate_limit_store || new Map();
if (!globalStore.__rate_limit_store) globalStore.__rate_limit_store = store;

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const bucket = store.get(key);
  if (!bucket || bucket.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (bucket.count < limit) {
    bucket.count += 1;
    return { ok: true };
  }
  return { ok: false, retryAfter: Math.max(0, Math.ceil((bucket.resetAt - now) / 1000)) };
}

export function getClientIp(headers: Headers): string {
  const h = headers.get('x-forwarded-for') || headers.get('x-real-ip') || '';
  if (h) return h.split(',')[0].trim();
  return '0.0.0.0';
}


type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const maxBuckets = 10_000;
let lastPruneAt = 0;

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

function pruneExpiredBuckets(now: number) {
  if (now - lastPruneAt < 60_000 && buckets.size < maxBuckets) return;
  lastPruneAt = now;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }

  if (buckets.size <= maxBuckets) return;

  const overflow = buckets.size - maxBuckets;
  let removed = 0;
  for (const key of buckets.keys()) {
    buckets.delete(key);
    removed += 1;
    if (removed >= overflow) break;
  }
}

function normalizeIp(value: string | null) {
  if (!value) return null;
  const ip = value.split(",")[0]?.trim();
  if (!ip) return null;
  return ip.replace(/^::ffff:/, "").slice(0, 80);
}

export function checkRateLimit(
  key: string,
  options: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  pruneExpiredBuckets(now);

  const safeKey = key.slice(0, 300);
  const existing = buckets.get(safeKey);
  const bucket = existing && existing.resetAt > now ? existing : { count: 0, resetAt: now + options.windowMs };
  bucket.count += 1;
  buckets.set(safeKey, bucket);

  if (bucket.count <= options.limit) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return {
    allowed: false,
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

export function getClientIp(request: Request) {
  return (
    normalizeIp(request.headers.get("cf-connecting-ip")) ??
    normalizeIp(request.headers.get("x-real-ip")) ??
    normalizeIp(request.headers.get("x-forwarded-for")) ??
    "unknown"
  );
}

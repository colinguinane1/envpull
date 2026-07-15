type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { ok: true };
}

/** Use the leftmost X-Forwarded-For hop (client as seen by the first proxy). */
export function clientIp(xff: string | undefined): string {
  if (!xff) {
    return "unknown";
  }
  const first = xff.split(",")[0]?.trim();
  return first && first.length > 0 ? first : "unknown";
}

export function clientKey(ip: string | undefined, email: string) {
  return `${ip ?? "unknown"}:${email.trim().toLowerCase()}`;
}

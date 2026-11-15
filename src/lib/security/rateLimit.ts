interface RateBucket {
  timestamps: number[];
}

const MAX_TRACKED_KEYS = 5_000;
const store = new Map<string, RateBucket>();

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAtMs: number;
  retryAfterSec: number;
}

/**
 * Limitador de taxa em janela deslizante (sliding window) em memória com teto máximo
 * de chaves rastreadas para evitar crescimento ilimitado de memória.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  const cutoff = now - windowMs;

  // Limpa entradas antigas quando o mapa cresce demais
  if (store.size >= MAX_TRACKED_KEYS && !store.has(key)) {
    for (const [k, bucket] of store.entries()) {
      const fresh = bucket.timestamps.filter((ts) => ts > cutoff);
      if (fresh.length === 0) {
        store.delete(k);
      } else {
        bucket.timestamps = fresh;
      }
      if (store.size < MAX_TRACKED_KEYS) break;
    }
    // Se ainda estiver cheio, descarta a entrada mais antiga
    if (store.size >= MAX_TRACKED_KEYS) {
      const oldestKey = store.keys().next().value;
      if (oldestKey !== undefined) {
        store.delete(oldestKey);
      }
    }
  }

  const bucket = store.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((ts) => ts > cutoff);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] ?? now;
    const resetAtMs = oldest + windowMs;
    const retryAfterSec = Math.max(1, Math.ceil((resetAtMs - now) / 1000));
    store.set(key, bucket);
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAtMs,
      retryAfterSec,
    };
  }

  bucket.timestamps.push(now);
  store.set(key, bucket);

  const oldest = bucket.timestamps[0] ?? now;
  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - bucket.timestamps.length),
    resetAtMs: oldest + windowMs,
    retryAfterSec: 0,
  };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 64);
  return "local-client";
}


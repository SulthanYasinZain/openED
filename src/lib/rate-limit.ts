import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

export type RateLimitResult =
  | { limited: false }
  | { limited: true; retryAfterSec: number };

export const RATE_LIMITS = {
  login: { requests: 5, window: "10 m" },
  register: { requests: 10, window: "1 h" },
} as const;

let redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

function windowToMs(window: string): number {
  const match = /^(\d+)\s*(s|m|h|d)$/.exec(window.trim());

  if (!match) throw new Error(`Unsupported rate limit window: ${window}`);

  const value = Number(match[1]);
  const unit = match[2] as "s" | "m" | "h" | "d";
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

  return value * multipliers[unit];
}

type Entry = { count: number; resetAt: number };
const memoryStore = new Map<string, Entry>();

function checkMemoryRateLimit(
  key: string,
  requests: number,
  window: string,
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowToMs(window);
  const entry = memoryStore.get(key);

  if (!entry || now >= entry.resetAt) {
    if (memoryStore.size > 5000) {
      for (const [k, v] of memoryStore) {
        if (now >= v.resetAt) memoryStore.delete(k);
      }
    }

    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false };
  }

  if (entry.count >= requests) {
    return {
      limited: true,
      retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count += 1;
  return { limited: false };
}

export async function checkRateLimit(
  key: string,
  preset: keyof typeof RATE_LIMITS,
): Promise<RateLimitResult> {
  const { requests, window } = RATE_LIMITS[preset];
  const client = getRedis();

  if (!client) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "Upstash Redis is not configured — rate limiting is per-instance only.",
      );
    }

    return checkMemoryRateLimit(key, requests, window);
  }

  try {
    const limiter = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(requests, window),
      analytics: true,
      prefix: `ratelimit:${preset}`,
    });

    const { success, reset } = await limiter.limit(key);

    if (success) return { limited: false };

    return {
      limited: true,
      retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  } catch (error) {
    console.error("Rate limiter error, allowing request:", error);
    return { limited: false };
  }
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip")?.trim() ?? "unknown";
}

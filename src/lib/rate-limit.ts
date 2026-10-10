import type { Redis } from "ioredis";
import { headers } from "next/headers";
import { getRedisClient } from "./redis";

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

  try {
    redis = getRedisClient();
  } catch {
    redis = null;
  }
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

async function checkRedisRateLimit(
  client: Redis,
  key: string,
  preset: keyof typeof RATE_LIMITS,
  requests: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = Date.now();
  const redisKey = `ratelimit:${preset}:${key}`;
  const member = `${now}:${Math.random().toString(36).slice(2)}`;

  const results = await client
    .pipeline()
    .zremrangebyscore(redisKey, 0, now - windowMs)
    .zadd(redisKey, now, member)
    .zcard(redisKey)
    .pexpire(redisKey, windowMs)
    .exec();

  const count = (results?.[2]?.[1] as number | null) ?? requests + 1;

  if (count <= requests) return { limited: false };

  return {
    limited: true,
    retryAfterSec: Math.max(1, Math.ceil(windowMs / 1000)),
  };
}

export async function checkRateLimit(
  key: string,
  preset: keyof typeof RATE_LIMITS,
): Promise<RateLimitResult> {
  const { requests, window } = RATE_LIMITS[preset];
  const client = getRedis();

  if (!client) {
    return checkMemoryRateLimit(key, requests, window);
  }

  try {
    return await checkRedisRateLimit(
      client,
      key,
      preset,
      requests,
      windowToMs(window),
    );
  } catch (error) {
    console.error("Rate limiter error, allowing request:", error);
    return checkMemoryRateLimit(key, requests, window);
  }
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip")?.trim() ?? "unknown";
}

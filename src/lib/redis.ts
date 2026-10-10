import { Redis } from "ioredis";

let redis: Redis | undefined;

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
    redis.on("error", () => {
      // Callers fail open; keep the noise down after their own logging.
    });
  }
  return redis;
}

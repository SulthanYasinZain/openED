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

export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const client = getRedisClient();
    let cursor = "0";
    do {
      const [next, keys] = await client.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100,
      );
      cursor = next;
      if (keys.length > 0) {
        await client.unlink(...keys);
      }
    } while (cursor !== "0");
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
}

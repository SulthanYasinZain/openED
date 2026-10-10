import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";
import { verifyAccessToken } from "@/lib/session";
import type { AuditAction, Prisma } from "../generated/prisma/client";

async function invalidateLogCache(): Promise<void> {
  try {
    const client = getRedisClient();
    let cursor = "0";
    do {
      const [next, keys] = await client.scan(
        cursor,
        "MATCH",
        "logs:v1:*",
        "COUNT",
        100,
      );
      cursor = next;
      if (keys.length > 0) {
        await client.unlink(...keys);
      }
    } while (cursor !== "0");
  } catch (error) {
    console.error("Log cache invalidation error:", error);
  }
}

export async function logAudit(input: {
  action: AuditAction;
  entityType: string;
  entityId?: number;
  description?: string;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  try {
    const token = (await cookies()).get("access_token")?.value;

    if (!token) {
      return;
    }

    const session = await verifyAccessToken(token);

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        description: input.description ?? null,
        metadata: input.metadata ?? undefined,
      },
    });

    await invalidateLogCache();
  } catch (error) {
    console.error("Audit log error:", error);
  }
}

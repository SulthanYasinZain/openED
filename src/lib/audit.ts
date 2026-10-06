import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/session";
import type { AuditAction, Prisma } from "../generated/prisma/client";

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
  } catch (error) {
    console.error("Audit log error:", error);
  }
}

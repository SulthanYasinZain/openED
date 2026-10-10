import { Activity01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import BackForwardButtons from "@/components/back-forward-buttons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { AuditAction, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from "./constants";
import LogsDataTable from "./data-table";
import type { LogChange, LogRow } from "./logs-feed";

const CACHE_TTL_SEC = 60;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "RESTORE",
  "RESET",
  "GRADE",
  "SUBMIT",
  "LOGIN",
  "LOGOUT",
  "GENERATE",
  "OTHER",
] as const;

const ACTION_PAST_TENSE: Record<string, string> = {
  CREATE: "Created",
  UPDATE: "Updated",
  DELETE: "Deleted",
  RESTORE: "Restored",
  RESET: "Reset",
  GRADE: "Graded",
  SUBMIT: "Submitted",
  LOGIN: "Logged in",
  LOGOUT: "Logged out",
  GENERATE: "Generated",
};

const ENTITY_LABEL: Record<string, string> = {
  User: "account",
  Class: "class",
  ClassMeeting: "meeting",
  Enrollment: "enrollment",
  School: "school",
  LearningMaterial: "material",
  ClassTeacher: "mentor assignment",
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseChanges(metadata: unknown): LogChange[] {
  if (typeof metadata !== "object" || metadata === null) {
    return [];
  }
  const changes = (metadata as { changes?: unknown }).changes;
  if (!Array.isArray(changes)) {
    return [];
  }
  return changes
    .filter(
      (change): change is Record<string, unknown> =>
        typeof change === "object" && change !== null,
    )
    .map((change) => ({
      field: String(change.field ?? "—"),
      previous: String(change.previous ?? "—"),
      next: String(change.next ?? "—"),
    }));
}

function formatExplanation(
  action: string,
  entityType: string,
  changes: LogChange[],
): string {
  const entity = ENTITY_LABEL[entityType] ?? entityType.toLowerCase();

  if (entityType === "User") {
    if (action === "CREATE") {
      const role = changes
        .find((change) => change.field === "role")
        ?.next.toLowerCase();
      return role
        ? `Created a new ${role} account and assigned the default permissions.`
        : "Created a new account and assigned the default permissions.";
    }
    if (action === "UPDATE") {
      const fields = changes.map((change) => change.field).join(", ");
      return fields
        ? `Updated ${fields} for this account.`
        : "Updated the account details.";
    }
    if (action === "DELETE") {
      return "Removed access for a former team member.";
    }
    if (action === "RESTORE") {
      return "Restored access for this account.";
    }
    if (action === "LOGIN") {
      return "Signed in to the dashboard.";
    }
    if (action === "LOGOUT") {
      return "Signed out of the dashboard.";
    }
  }

  if (action === "CREATE") {
    return `Added a new ${entity} record.`;
  }
  if (action === "UPDATE") {
    return `Modified this ${entity} record.`;
  }
  if (action === "DELETE") {
    return `Removed this ${entity} record.`;
  }
  if (action === "RESTORE") {
    return `Restored this ${entity} record.`;
  }

  const verb = ACTION_PAST_TENSE[action] ?? action;
  return `${verb} this ${entity} record.`;
}

function toRow(
  log: Prisma.AuditLogGetPayload<{ include: { actor: true } }>,
): LogRow {
  const changes = parseChanges(log.metadata);
  return {
    id: log.id,
    action: log.action,
    title:
      log.description ??
      `${ACTION_PAST_TENSE[log.action] ?? log.action} ${log.entityType}${log.entityId === null ? "" : ` #${log.entityId}`}`,
    description: formatExplanation(log.action, log.entityType, changes),
    actorName: log.actor.name ?? "Unnamed",
    actorEmail: log.actor.email,
    date: log.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: log.createdAt.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    tables: log.entityType,
    entityId: log.entityId,
    loggedAt: log.createdAt.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    loggedDay: log.createdAt.toISOString().slice(0, 10),
    changes,
  };
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const q = first(params.q).trim().slice(0, 100);
  const actionParam = first(params.action);
  const action: AuditAction | "All actions" = (
    ACTIONS as readonly string[]
  ).includes(actionParam)
    ? (actionParam as AuditAction)
    : "All actions";
  const after = DATE_RE.test(first(params.after)) ? first(params.after) : "";
  const before = DATE_RE.test(first(params.before)) ? first(params.before) : "";
  const sizeRaw = Number(first(params.size));
  const pageSize = PAGE_SIZES.includes(sizeRaw) ? sizeRaw : DEFAULT_PAGE_SIZE;

  const where: Prisma.AuditLogWhereInput = {};
  if (action !== "All actions") {
    where.action = action;
  }
  if (after || before) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (after) {
      createdAt.gte = new Date(`${after}T00:00:00`);
    }
    if (before) {
      const nextDay = new Date(`${before}T00:00:00`);
      nextDay.setDate(nextDay.getDate() + 1);
      createdAt.lt = nextDay;
    }
    where.createdAt = createdAt;
  }
  if (q) {
    where.OR = [
      { description: { contains: q, mode: "insensitive" } },
      { entityType: { contains: q, mode: "insensitive" } },
      {
        actor: {
          is: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          },
        },
      },
    ];
  }

  const filterKey = JSON.stringify({ q, action, after, before, pageSize });

  let total = 0;
  try {
    const cachedCount = await getRedisClient().get(
      `logs:v1:${filterKey}:count`,
    );
    if (cachedCount !== null) {
      total = Number(cachedCount);
    } else {
      total = await prisma.auditLog.count({ where });
      await getRedisClient().setex(
        `logs:v1:${filterKey}:count`,
        CACHE_TTL_SEC,
        String(total),
      );
    }
  } catch (error) {
    console.error("Log cache error, querying database:", error);
    total = await prisma.auditLog.count({ where });
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageRaw = Number(first(params.page));
  const page =
    Number.isInteger(pageRaw) && pageRaw >= 1
      ? Math.min(pageRaw, totalPages)
      : 1;

  let rows: LogRow[] = [];
  const pageKey = `logs:v1:${filterKey}:p${page}`;
  try {
    const cachedPage = await getRedisClient().get(pageKey);
    if (cachedPage !== null) {
      rows = JSON.parse(cachedPage) as LogRow[];
    } else {
      const logs = await prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { actor: true },
      });
      rows = logs.map(toRow);
      await getRedisClient().setex(
        pageKey,
        CACHE_TTL_SEC,
        JSON.stringify(rows),
      );
    }
  } catch (error) {
    console.error("Log cache error, querying database:", error);
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { actor: true },
    });
    rows = logs.map(toRow);
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 text-[13px] text-stone-900">
      <div className="flex items-center gap-0.5">
        <BackForwardButtons />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/dashboard" />}>
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                <span className="inline-flex items-center gap-1.5">
                  <HugeiconsIcon
                    icon={Activity01Icon}
                    size={12}
                    strokeWidth={2}
                  />
                  Activity logs
                </span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mt-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Activity logs{" "}
          <span className="text-muted-foreground font-normal">{total}</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {total} latest events. Logs are read-only and cannot be changed.
        </p>
      </div>

      <LogsDataTable
        data={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        initialSearch={q}
        currentAction={action}
        actions={["All actions", ...ACTIONS]}
        after={after}
        before={before}
      />
    </main>
  );
}

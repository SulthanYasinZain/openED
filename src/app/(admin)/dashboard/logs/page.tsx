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
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/prisma";
import LogsDataTable from "./data-table";
import type { LogChange } from "./logs-feed";

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

export default async function LogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      actor: { select: { name: true, email: true } },
    },
  });

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
          <span className="text-muted-foreground font-normal">
            {logs.length}
          </span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {logs.length} latest events. Logs are read-only and cannot be changed.
        </p>
      </div>

      <Separator className="mt-4" />
      <LogsDataTable
        data={logs.map((log) => {
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
            loggedDay: log.createdAt.toISOString().slice(0, 10),
            loggedAt: log.createdAt.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            changes,
          };
        })}
      />
    </main>
  );
}

import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { prisma } from "@/lib/prisma";

export default async function LogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      actor: { select: { name: true, email: true } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/dashboard" />}>
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Logs</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6">
        <h1 className="text-2xl font-semibold tracking-tight">Activity logs</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {logs.length} latest events. Logs are read-only and cannot be changed.
        </p>
      </div>

      <ul className="mt-8 space-y-3">
        {logs.length === 0 && (
          <li className="border-border rounded-lg border px-4 py-8 text-center">
            <p className="text-muted-foreground text-sm">No activity yet.</p>
          </li>
        )}

        {logs.map((log) => (
          <li
            key={log.id}
            className="border-border flex items-start justify-between gap-4 rounded-lg border px-4 py-3"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border px-2 py-0.5 text-xs font-medium">
                  {log.action}
                </span>
                <span className="text-sm font-medium">
                  {log.entityType}
                  {log.entityId ? ` #${log.entityId}` : ""}
                </span>
              </div>
              {log.description && (
                <p className="text-muted-foreground truncate text-sm">
                  {log.description}
                </p>
              )}
              <p className="text-muted-foreground text-xs">
                {log.createdAt.toLocaleString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="max-w-40 truncate text-sm font-medium">
                {log.actor.name ?? "Unnamed"}
              </p>
              <p className="text-muted-foreground max-w-40 truncate text-xs">
                {log.actor.email}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

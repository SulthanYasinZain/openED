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
import LogsTable from "./logs-table";

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

      <div className="mt-8">
        <LogsTable
          data={logs.map((log) => ({
            id: log.id,
            action: log.action,
            entityType: log.entityType,
            entityId: log.entityId,
            description: log.description,
            actorName: log.actor.name ?? "Unnamed",
            actorEmail: log.actor.email,
            createdAt: log.createdAt.toISOString(),
          }))}
        />
      </div>
    </main>
  );
}

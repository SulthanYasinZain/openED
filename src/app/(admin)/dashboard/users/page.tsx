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
import UsersDataTable from "./data-table";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    where: { isDeleted: false },
    orderBy: { id: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 text-[13px] text-stone-900">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/dashboard" />}>
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Users</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          User management{" "}
          <span className="text-muted-foreground font-normal">
            {users.length}
          </span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your team members and their account permissions here.
        </p>
      </div>

      <UsersDataTable
        data={users.map((user) => ({
          ...user,
          joinedAt: user.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}

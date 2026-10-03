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
import CreateUserDialog from "./create-user-dialog";
import DeleteUserButton from "./delete-user-button";
import EditUserDialog from "./edit-user-dialog";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    where: { isDeleted: false },
    orderBy: { id: "asc" },
    select: { id: true, name: true, email: true, role: true },
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
            <BreadcrumbPage>Users</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {users.length} registered accounts
          </p>
        </div>
        <CreateUserDialog />
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {users.length === 0 && (
          <li className="border-border rounded-lg border px-4 py-8 text-center sm:col-span-2 lg:col-span-3">
            <p className="text-muted-foreground text-sm">
              No users yet. Create the first one.
            </p>
          </li>
        )}

        {users.map((user) => (
          <li
            key={user.id}
            className="border-border flex items-start justify-between gap-3 rounded-lg border px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {user.name ?? "Unnamed"}
              </p>
              <p className="text-muted-foreground truncate text-sm">
                {user.email}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">{user.role}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <EditUserDialog user={user} />
              <DeleteUserButton userId={user.id} />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

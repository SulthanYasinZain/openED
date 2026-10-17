import { UserGroupIcon } from "@hugeicons/core-free-icons";
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
import UsersDataTable from "./data-table";
import { fetchUsersData } from "./fetch-users";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const data = await fetchUsersData(params);

  return (
    <main className="w-full px-6 py-10 text-[13px] text-stone-900">
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
                    icon={UserGroupIcon}
                    size={12}
                    strokeWidth={2}
                  />
                  User management
                </span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mt-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          User management{" "}
          <span className="text-muted-foreground font-normal">
            {data.total}
          </span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your team members and their account permissions here.
        </p>
      </div>

      <UsersDataTable
        rows={data.rows}
        allRows={data.allRows}
        total={data.total}
        page={data.page}
        totalPages={data.totalPages}
        initialSearch={data.q}
        currentRole={data.role}
        after={data.after}
        before={data.before}
      />
    </main>
  );
}

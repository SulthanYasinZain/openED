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
import type { Prisma, Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";
import { PAGE_SIZE } from "./constants";
import UsersDataTable from "./data-table";
import type { UserRow } from "./users-table";

const CACHE_TTL_SEC = 60;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ROLES: Role[] = ["ADMIN", "MENTOR", "STUDENT", "SCHOOL"];

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

const select = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

type SelectedUser = Prisma.UserGetPayload<{ select: typeof select }>;

function toRow(user: SelectedUser): UserRow {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    joinedAt: user.createdAt.toISOString(),
  };
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const q = first(params.q).trim().slice(0, 100);
  const roleParam = first(params.role).toUpperCase();
  const role: Role | null = (ROLES as string[]).includes(roleParam)
    ? (roleParam as Role)
    : null;
  const after = DATE_RE.test(first(params.after)) ? first(params.after) : "";
  const before = DATE_RE.test(first(params.before)) ? first(params.before) : "";

  const where: Prisma.UserWhereInput = { isDeleted: false };
  if (role) {
    where.role = role;
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
    const or: Prisma.UserWhereInput[] = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
    if ((ROLES as string[]).includes(q.toUpperCase())) {
      or.push({ role: q.toUpperCase() as Role });
    }
    where.OR = or;
  }

  const filterKey = JSON.stringify({ q, role, after, before });

  let total = 0;
  try {
    const cachedCount = await getRedisClient().get(
      `users:v1:${filterKey}:count`,
    );
    if (cachedCount !== null) {
      total = Number(cachedCount);
    } else {
      total = await prisma.user.count({ where });
      await getRedisClient().setex(
        `users:v1:${filterKey}:count`,
        CACHE_TTL_SEC,
        String(total),
      );
    }
  } catch (error) {
    console.error("Users cache error, querying database:", error);
    total = await prisma.user.count({ where });
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageRaw = Number(first(params.page));
  const page =
    Number.isInteger(pageRaw) && pageRaw >= 1
      ? Math.min(pageRaw, totalPages)
      : 1;

  let rows: UserRow[] = [];
  let allRows: UserRow[] = [];
  const pageKey = `users:v1:${filterKey}:p${page}`;
  try {
    const cachedPage = await getRedisClient().get(pageKey);
    const cachedAll = await getRedisClient().get(`users:v1:${filterKey}:all`);
    if (cachedPage !== null && cachedAll !== null) {
      rows = JSON.parse(cachedPage) as UserRow[];
      allRows = JSON.parse(cachedAll) as UserRow[];
    } else {
      const [pageUsers, filteredUsers]: [SelectedUser[], SelectedUser[]] =
        await Promise.all([
          prisma.user.findMany({
            where,
            orderBy: { id: "asc" },
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            select,
          }),
          prisma.user.findMany({
            where,
            orderBy: { id: "asc" },
            select,
          }),
        ]);
      rows = pageUsers.map(toRow);
      allRows = filteredUsers.map(toRow);
      await getRedisClient().setex(
        pageKey,
        CACHE_TTL_SEC,
        JSON.stringify(rows),
      );
      await getRedisClient().setex(
        `users:v1:${filterKey}:all`,
        CACHE_TTL_SEC,
        JSON.stringify(allRows),
      );
    }
  } catch (error) {
    console.error("Users cache error, querying database:", error);
    const [pageUsers, filteredUsers]: [SelectedUser[], SelectedUser[]] =
      await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: { id: "asc" },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          select,
        }),
        prisma.user.findMany({
          where,
          orderBy: { id: "asc" },
          select,
        }),
      ]);
    rows = pageUsers.map(toRow);
    allRows = filteredUsers.map(toRow);
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
          <span className="text-muted-foreground font-normal">{total}</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your team members and their account permissions here.
        </p>
      </div>

      <UsersDataTable
        rows={rows}
        allRows={allRows}
        total={total}
        page={page}
        totalPages={totalPages}
        initialSearch={q}
        currentRole={role}
        after={after}
        before={before}
      />
    </main>
  );
}

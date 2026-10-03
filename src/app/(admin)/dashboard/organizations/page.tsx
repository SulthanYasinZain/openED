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
import CreateSchoolDialog from "./create-school-dialog";
import OrganizationsTable from "./organizations-table";

export default async function OrganizationsPage() {
  const schools = await prisma.school.findMany({
    where: { isDeleted: false },
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      address: true,
      classes: {
        where: { isDeleted: false },
        orderBy: { name: "asc" },
        select: { id: true, name: true, code: true },
      },
    },
  });

  const totalClasses = schools.reduce(
    (sum, school) => sum + school.classes.length,
    0,
  );

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
            <BreadcrumbPage>Organizations</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Organizations
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {schools.length} organizations · {totalClasses} classes
          </p>
        </div>
        <CreateSchoolDialog />
      </div>

      <div className="mt-8">
        <OrganizationsTable
          data={schools.map((school) => ({
            id: school.id,
            name: school.name,
            address: school.address,
            classCount: school.classes.length,
            classNames: school.classes.map(
              (classItem) => `${classItem.name} · ${classItem.code}`,
            ),
          }))}
        />
      </div>
    </main>
  );
}

"use client";

import { createColumnHelper } from "@tanstack/react-table";
import type { appFeatures } from "@/components/data-table";
import DataTable, { SortButton } from "@/components/data-table";
import DeleteSchoolButton from "./delete-school-button";

export type OrganizationRow = {
  id: number;
  name: string;
  address: string | null;
  classCount: number;
  classNames: string[];
};

const helper = createColumnHelper<typeof appFeatures, OrganizationRow>();

const columns = helper.columns([
  helper.accessor("name", {
    header: (context) => (
      <SortButton
        label="Name"
        sorted={context.column.getIsSorted()}
        onToggle={() =>
          context.column.toggleSorting(context.column.getIsSorted() === "asc")
        }
      />
    ),
    cell: (context) => (
      <span className="block">
        <span className="block font-medium">{context.row.original.name}</span>
        {context.row.original.address && (
          <span className="text-muted-foreground block text-xs">
            {context.row.original.address}
          </span>
        )}
      </span>
    ),
  }),
  helper.accessor("classCount", {
    header: (context) => (
      <SortButton
        label="Classes"
        sorted={context.column.getIsSorted()}
        onToggle={() =>
          context.column.toggleSorting(context.column.getIsSorted() === "asc")
        }
      />
    ),
    cell: (context) => (
      <span className="block">
        <span className="rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap">
          {context.row.original.classCount}{" "}
          {context.row.original.classCount === 1 ? "class" : "classes"}
        </span>
        {context.row.original.classNames.length > 0 && (
          <span className="text-muted-foreground mt-1 block max-w-xs truncate text-xs">
            {context.row.original.classNames.join(", ")}
          </span>
        )}
      </span>
    ),
  }),
  helper.display({
    id: "actions",
    enableHiding: false,
    cell: (context) => (
      <div className="flex items-center justify-end">
        <DeleteSchoolButton schoolId={context.row.original.id} />
      </div>
    ),
  }),
]);

export default function OrganizationsTable({
  data,
}: {
  data: OrganizationRow[];
}) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKeys={["name", "address"]}
      searchPlaceholder="Search organizations..."
    />
  );
}

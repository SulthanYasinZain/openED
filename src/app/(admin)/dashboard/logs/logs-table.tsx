"use client";

import { createColumnHelper } from "@tanstack/react-table";
import type { appFeatures } from "@/components/data-table";
import DataTable, { SortButton } from "@/components/data-table";

export type LogRow = {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  description: string | null;
  actorName: string;
  actorEmail: string;
  createdAt: string;
};

const helper = createColumnHelper<typeof appFeatures, LogRow>();

const columns = helper.columns([
  helper.accessor("action", {
    header: (context) => (
      <SortButton
        label="Action"
        sorted={context.column.getIsSorted()}
        onToggle={() =>
          context.column.toggleSorting(context.column.getIsSorted() === "asc")
        }
      />
    ),
    cell: (context) => (
      <span className="rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap">
        {context.row.original.action}
      </span>
    ),
  }),
  helper.accessor("entityType", {
    header: "Entity",
    cell: (context) => (
      <span className="font-medium whitespace-nowrap">
        {context.row.original.entityType}
        {context.row.original.entityId
          ? ` #${context.row.original.entityId}`
          : ""}
      </span>
    ),
  }),
  helper.accessor("description", {
    header: "Details",
    cell: (context) => (
      <span className="text-muted-foreground block max-w-md truncate">
        {context.row.original.description ?? "—"}
      </span>
    ),
  }),
  helper.accessor("actorName", {
    header: "Actor",
    cell: (context) => (
      <span className="block">
        <span className="block font-medium">
          {context.row.original.actorName}
        </span>
        <span className="text-muted-foreground block text-xs">
          {context.row.original.actorEmail}
        </span>
      </span>
    ),
  }),
  helper.accessor("createdAt", {
    header: (context) => (
      <SortButton
        label="Time"
        sorted={context.column.getIsSorted()}
        onToggle={() =>
          context.column.toggleSorting(context.column.getIsSorted() === "asc")
        }
      />
    ),
    cell: (context) => (
      <span className="text-muted-foreground text-xs whitespace-nowrap">
        {new Date(context.row.original.createdAt).toLocaleString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    ),
  }),
]);

export default function LogsTable({ data }: { data: LogRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKeys={[
        "action",
        "entityType",
        "description",
        "actorName",
        "actorEmail",
      ]}
      searchPlaceholder="Search action, entity, or actor..."
      initialSorting={[{ id: "createdAt", desc: true }]}
    />
  );
}

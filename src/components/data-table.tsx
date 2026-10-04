"use client";

import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowLeftDoubleIcon,
  ArrowRight01Icon,
  ArrowRightDoubleIcon,
  ArrowUp01Icon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  FlexRender,
  filterFn_includesString,
  globalFilteringFeature,
  type RowData,
  rowPaginationFeature,
  rowSortingFeature,
  type SortingState,
  type TableOptions,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const appFeatures = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesString: filterFn_includesString },
});

export function SortButton({
  label,
  sorted,
  onToggle,
}: {
  label: string;
  sorted: false | "asc" | "desc";
  onToggle: () => void;
}) {
  return (
    <Button type="button" variant="ghost" size="sm" onClick={onToggle}>
      {label}
      <HugeiconsIcon
        icon={sorted === "desc" ? ArrowDown01Icon : ArrowUp01Icon}
        strokeWidth={2}
      />
    </Button>
  );
}

const PAGE_SIZES = [10, 15, 25, 50];

function pageItems(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index);
  }

  const wanted = new Set(
    [0, total - 1, current - 1, current, current + 1].filter(
      (page) => page >= 0 && page < total,
    ),
  );
  const sorted = [...wanted].sort((a, b) => a - b);
  const items: (number | string)[] = [];
  let previous = -2;

  for (const page of sorted) {
    if (page - previous > 1) {
      items.push(`ellipsis-${page}`);
    }
    items.push(page);
    previous = page;
  }

  return items;
}

function ColumnVisibilityToggle({
  table,
  labels,
}: {
  table: {
    getAllLeafColumns: () => {
      id: string;
      getCanHide: () => boolean;
      getIsVisible: () => boolean;
      toggleVisibility: (visible: boolean) => void;
      columnDef: { header?: unknown };
    }[];
  };
  labels: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const hideable = table.getAllLeafColumns().filter((column) => {
    if (!column.getCanHide()) {
      return false;
    }
    return typeof column.columnDef.header === "string"
      ? true
      : column.columnDef.header !== undefined;
  });

  if (hideable.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((value) => !value)}
      >
        <HugeiconsIcon icon={ViewOffIcon} strokeWidth={2} />
        Hide
      </Button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close column visibility menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div className="border-border bg-popover absolute right-0 z-20 mt-2 w-48 rounded-lg border p-2 shadow-lg">
            {hideable.map((column) => (
              <label
                key={column.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
              >
                <input
                  type="checkbox"
                  checked={column.getIsVisible()}
                  onChange={(event) =>
                    column.toggleVisibility(event.target.checked)
                  }
                  className="accent-primary h-4 w-4"
                />
                <span className="capitalize">
                  {labels[column.id] ?? column.id}
                </span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface DataTableProps<TData extends RowData> {
  columns: TableOptions<typeof appFeatures, TData>["columns"];
  data: TData[];
  searchKeys: (keyof TData)[];
  searchPlaceholder: string;
  initialSorting?: SortingState;
  actions?: React.ReactNode;
  externalSearch?: { value: string; onChange: (value: string) => void };
  showColumnToggle?: boolean;
  columnLabels?: Record<string, string>;
}

export default function DataTable<TData extends RowData>({
  columns,
  data,
  searchKeys,
  searchPlaceholder,
  initialSorting = [],
  actions,
  externalSearch,
  showColumnToggle = false,
  columnLabels = {},
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [internalFilter, setInternalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  const globalFilter = externalSearch?.value ?? internalFilter;
  const onGlobalFilterChange = externalSearch?.onChange ?? setInternalFilter;

  const table = useTable(
    {
      features: appFeatures,
      data,
      columns,
      state: { sorting, globalFilter, columnVisibility },
      onSortingChange: setSorting,
      onGlobalFilterChange,
      onColumnVisibilityChange: setColumnVisibility,
      globalFilterFn: (row, _columnId, filterValue) => {
        const haystack = searchKeys
          .map((key) => String(row.original[key] ?? ""))
          .join(" ")
          .toLowerCase();
        return haystack.includes(String(filterValue).toLowerCase());
      },
      initialState: { pagination: { pageIndex: 0, pageSize: 15 } },
    },
    (state) => state,
  );

  const pageCount = table.getPageCount();
  const pageIndex = table.state.pagination.pageIndex;
  const pageSize = table.state.pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;
  const rangeStart = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const rangeEnd = Math.min(rangeStart + pageSize - 1, totalRows);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        {!externalSearch && (
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(event) => onGlobalFilterChange(event.target.value)}
            className="max-w-sm"
          />
        )}
        <div className="ml-auto flex items-center gap-2">
          {showColumnToggle && (
            <ColumnVisibilityToggle table={table} labels={columnLabels} />
          )}
          {actions}
        </div>
      </div>
      <div className="border-border overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-24 text-center text-sm"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label
          htmlFor="rows-per-page"
          className="text-muted-foreground flex items-center gap-2 text-sm"
        >
          Rows per page
          <select
            id="rows-per-page"
            value={pageSize}
            onChange={(event) => table.setPageSize(Number(event.target.value))}
            className="border-border rounded-lg border bg-transparent px-2 py-1 text-sm"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <p className="text-muted-foreground text-sm">
          {rangeStart}-{rangeEnd} of {totalRows} rows
        </p>
        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="First page"
          >
            <HugeiconsIcon icon={ArrowLeftDoubleIcon} strokeWidth={2} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
          </Button>
          {pageItems(pageIndex, pageCount).map((item) =>
            typeof item === "number" ? (
              <Button
                key={item}
                type="button"
                variant={item === pageIndex ? "default" : "ghost"}
                size="sm"
                onClick={() => table.setPageIndex(item)}
              >
                {item + 1}
              </Button>
            ) : (
              <span
                key={item}
                className="text-muted-foreground px-1 text-sm"
                aria-hidden="true"
              >
                …
              </span>
            ),
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Last page"
          >
            <HugeiconsIcon icon={ArrowRightDoubleIcon} strokeWidth={2} />
          </Button>
        </div>
      </div>
    </div>
  );
}

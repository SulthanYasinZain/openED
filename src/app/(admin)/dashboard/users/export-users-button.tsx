"use client";

import {
  ArrowDown01Icon,
  Csv01Icon,
  Download01Icon,
  Pdf01Icon,
  Xls01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  exportUsersCsv,
  exportUsersPdf,
  exportUsersXlsx,
} from "./export-users";
import type { UserRow } from "./users-table";

export default function ExportUsersButton({ rows }: { rows: UserRow[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={rows.length === 0}
          >
            <HugeiconsIcon
              icon={Download01Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            Export{" "}
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={2}
              data-icon="inline-end"
            />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="px-3 py-2"
          onClick={() => exportUsersPdf(rows)}
        >
          <HugeiconsIcon icon={Pdf01Icon} strokeWidth={2} />
          PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          className="px-3 py-2"
          onClick={() => exportUsersCsv(rows)}
        >
          <HugeiconsIcon icon={Csv01Icon} strokeWidth={2} />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          className="px-3 py-2"
          onClick={() => exportUsersXlsx(rows)}
        >
          <HugeiconsIcon icon={Xls01Icon} strokeWidth={2} />
          XLSX
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

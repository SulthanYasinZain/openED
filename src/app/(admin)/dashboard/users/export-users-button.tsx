"use client";

import { Download01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import type { UserRow } from "./users-table";
import { formatJoinedAt } from "./users-table";

function toCsvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export default function ExportUsersButton({ rows }: { rows: UserRow[] }) {
  function handleExport() {
    const header = ["Full name", "Email", "Role", "Joined date"];
    const lines = rows.map((row) =>
      [
        toCsvCell(row.name ?? "Unnamed"),
        toCsvCell(row.email),
        toCsvCell(row.role),
        toCsvCell(formatJoinedAt(row.joinedAt)),
      ].join(","),
    );

    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "users.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={rows.length === 0}
    >
      <HugeiconsIcon icon={Download01Icon} strokeWidth={2} />
      Export
    </Button>
  );
}

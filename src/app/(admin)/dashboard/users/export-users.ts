import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import type { UserRow } from "./users-table";
import { formatJoinedAt, formatRole } from "./users-table";

function toCsvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportUsersCsv(rows: UserRow[]) {
  const header = ["Full name", "Email", "Role", "Joined date"];
  const lines = rows.map((row) =>
    [
      toCsvCell(row.name ?? "Unnamed"),
      toCsvCell(row.email),
      toCsvCell(formatRole(row.role)),
      toCsvCell(formatJoinedAt(row.joinedAt)),
    ].join(","),
  );

  downloadBlob(
    new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    }),
    "users.csv",
  );
}

export function exportUsersXlsx(rows: UserRow[]) {
  const sheet = XLSX.utils.json_to_sheet(
    rows.map((row) => ({
      "Full name": row.name ?? "Unnamed",
      Email: row.email,
      Role: formatRole(row.role),
      "Joined date": formatJoinedAt(row.joinedAt),
    })),
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Users");
  XLSX.writeFile(workbook, "users.xlsx");
}

export function exportUsersPdf(rows: UserRow[]) {
  const doc = new jsPDF({ unit: "pt" });
  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const usableWidth = pageWidth - margin * 2;
  const columns = [
    { title: "Full name", width: 0.28 },
    { title: "Email", width: 0.34 },
    { title: "Role", width: 0.14 },
    { title: "Joined date", width: 0.24 },
  ];
  const lineHeight = 16;

  doc.setFontSize(14);
  doc.text("Users", margin, 40);

  let y = 64;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  for (const [index, column] of columns.entries()) {
    const x =
      margin +
      usableWidth *
        columns.slice(0, index).reduce((sum, item) => sum + item.width, 0);
    doc.text(column.title, x, y, { maxWidth: usableWidth * column.width });
  }
  doc.setFont("helvetica", "normal");

  for (const row of rows) {
    y += lineHeight;
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    const values = [
      row.name ?? "Unnamed",
      row.email,
      formatRole(row.role),
      formatJoinedAt(row.joinedAt),
    ];
    for (const [index, value] of values.entries()) {
      const x =
        margin +
        usableWidth *
          columns.slice(0, index).reduce((sum, item) => sum + item.width, 0);
      doc.text(value, x, y, {
        maxWidth: usableWidth * columns[index].width - 8,
      });
    }
  }

  doc.save("users.pdf");
}

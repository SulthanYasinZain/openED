import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { formatStatus } from "./class-row-actions";
import type { ClassRow } from "./classes-data-table";

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

function roster(classItem: ClassRow) {
  return [
    ...classItem.teachers.map((member) => ({
      name: member.name ?? "Unnamed",
      email: member.email,
      role: "Teacher",
    })),
    ...classItem.students.map((member) => ({
      name: member.name ?? "Unnamed",
      email: member.email,
      role: "Student",
    })),
  ];
}

function filename(classItem: ClassRow, extension: string) {
  return `class-${classItem.code}-roster.${extension}`;
}

export function exportClassCsv(classItem: ClassRow) {
  const header = ["Full name", "Email", "Role"];
  const lines = roster(classItem).map((member) =>
    [
      toCsvCell(member.name),
      toCsvCell(member.email),
      toCsvCell(member.role),
    ].join(","),
  );

  downloadBlob(
    new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    }),
    filename(classItem, "csv"),
  );
}

export function exportClassXlsx(classItem: ClassRow) {
  const sheet = XLSX.utils.json_to_sheet(
    roster(classItem).map((member) => ({
      "Full name": member.name,
      Email: member.email,
      Role: member.role,
    })),
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Roster");
  XLSX.writeFile(workbook, filename(classItem, "xlsx"));
}

export function exportClassPdf(classItem: ClassRow) {
  const doc = new jsPDF({ unit: "pt" });
  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const usableWidth = pageWidth - margin * 2;
  const columns = [
    { title: "Full name", width: 0.36 },
    { title: "Email", width: 0.44 },
    { title: "Role", width: 0.2 },
  ];
  const lineHeight = 16;

  doc.setFontSize(14);
  doc.text(classItem.name, margin, 40);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${classItem.schoolName} · ${classItem.code} · ${formatStatus(classItem.status)}`,
    margin,
    56,
  );

  let y = 80;
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

  for (const member of roster(classItem)) {
    y += lineHeight;
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    const values = [member.name, member.email, member.role];
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

  doc.save(filename(classItem, "pdf"));
}

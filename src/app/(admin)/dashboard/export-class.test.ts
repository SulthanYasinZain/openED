import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import type { ClassRow } from "./classes-data-table";
import {
  exportClassCsv,
  exportClassPdf,
  exportClassXlsx,
} from "./export-class";

jest.mock("jspdf", () => ({ jsPDF: jest.fn() }));
jest.mock("xlsx", () => ({
  utils: {
    json_to_sheet: jest.fn(),
    book_new: jest.fn(),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}));
jest.mock("./class-row-actions", () => ({ formatStatus: () => "Active" }));
const classItem: ClassRow = {
  id: 1,
  name: "Robotics",
  code: "ABC123",
  schoolId: 2,
  schoolName: "School",
  status: "ACTIVE",
  meetingCount: 1,
  teachers: [{ id: 3, name: 'Ada "Teacher", A', email: "ada@example.com" }],
  students: [{ id: 4, name: null, email: "student@example.com" }],
};
const createObjectURL = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
const revokeObjectURL = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
beforeEach(() => {
  jest.resetAllMocks();
});
afterEach(() => {
  jest.restoreAllMocks();
  for (const [key, descriptor] of [
    ["createObjectURL", createObjectURL],
    ["revokeObjectURL", revokeObjectURL],
  ] as const) {
    if (descriptor) Object.defineProperty(URL, key, descriptor);
    else Reflect.deleteProperty(URL, key);
  }
});

it("escapes quoted CSV cells, includes both member roles, and releases the download URL", async () => {
  let blob: Blob | undefined;
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: jest.fn((value: Blob) => {
      blob = value;
      return "blob:roster";
    }),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: jest.fn(),
  });
  const click = jest
    .spyOn(HTMLAnchorElement.prototype, "click")
    .mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe("class-ABC123-roster.csv");
      expect(this.href).toBe("blob:roster");
    });
  exportClassCsv(classItem);
  expect(click).toHaveBeenCalledTimes(1);
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:roster");
  if (!blob) throw new Error("Expected CSV download");
  const exportedBlob = blob;
  const content = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(exportedBlob);
  });
  expect(content).toBe(
    'Full name,Email,Role\n"Ada ""Teacher"", A","ada@example.com","Teacher"\n"Unnamed","student@example.com","Student"',
  );
});
it("exports a workbook containing teacher and student roster rows", () => {
  const workbook = { Sheets: {}, SheetNames: [] };
  const sheet = {};
  jest.mocked(XLSX.utils.book_new).mockReturnValue(workbook);
  jest.mocked(XLSX.utils.json_to_sheet).mockReturnValue(sheet);
  exportClassXlsx(classItem);
  expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([
    {
      "Full name": 'Ada "Teacher", A',
      Email: "ada@example.com",
      Role: "Teacher",
    },
    { "Full name": "Unnamed", Email: "student@example.com", Role: "Student" },
  ]);
  expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
    workbook,
    sheet,
    "Roster",
  );
  expect(XLSX.writeFile).toHaveBeenCalledWith(
    workbook,
    "class-ABC123-roster.xlsx",
  );
});
it("paginates long PDF rosters and saves a class-specific filename", () => {
  const doc = {
    internal: { pageSize: { getWidth: () => 600, getHeight: () => 150 } },
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    text: jest.fn(),
    addPage: jest.fn(),
    save: jest.fn(),
  };
  (jsPDF as unknown as jest.Mock).mockImplementation(() => doc);
  exportClassPdf({
    ...classItem,
    students: Array.from({ length: 10 }, (_, i) => ({
      id: i + 10,
      name: `Student ${i}`,
      email: `student${i}@example.com`,
    })),
  });
  expect(doc.addPage).toHaveBeenCalled();
  expect(doc.text).toHaveBeenCalledWith(
    "Student 9",
    expect.any(Number),
    expect.any(Number),
    expect.any(Object),
  );
  expect(doc.save).toHaveBeenCalledWith("class-ABC123-roster.pdf");
});

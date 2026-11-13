import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { checkSession } from "@/lib/session";
import { createSchoolAction, deleteSchoolAction } from "./school";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/lib/session", () => ({ checkSession: jest.fn() }));
jest.mock("@/lib/audit", () => ({ logAudit: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    school: {
      create: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    class: { count: jest.fn() },
  },
}));
const db = jest.mocked(prisma.school);
function form(name = " Example School ", address = " Main Street ") {
  const data = new FormData();
  data.set("name", name);
  data.set("address", address);
  return data;
}
beforeEach(() => {
  jest.resetAllMocks();
  db.create.mockResolvedValue({ id: 2 } as never);
  db.count.mockResolvedValue(2);
  db.findUnique.mockResolvedValue({ name: "Example School" } as never);
  (prisma.class.count as jest.Mock).mockResolvedValue(0);
});

it.each(["", " ", "x".repeat(101)])(
  "rejects invalid organization name %s",
  async (name) => {
    expect((await createSchoolAction({}, form(name))).error).toBeTruthy();
    expect(db.create).not.toHaveBeenCalled();
  },
);
it("rejects an oversized address", async () => {
  expect(
    (await createSchoolAction({}, form("School", "x".repeat(256)))).error,
  ).toBeTruthy();
  expect(db.create).not.toHaveBeenCalled();
});
it("creates a trimmed organization and audits it", async () => {
  expect(await createSchoolAction({}, form())).toEqual({ error: "" });
  expect(checkSession).toHaveBeenCalledWith("ADMIN");
  expect(db.create).toHaveBeenCalledWith({
    data: { name: "Example School", address: "Main Street" },
  });
  expect(logAudit).toHaveBeenCalledWith(
    expect.objectContaining({ action: "CREATE", entityId: 2 }),
  );
  expect(revalidatePath).toHaveBeenCalledWith("/dashboard/organizations");
});
it("stores a missing address as null", async () => {
  await createSchoolAction({}, form("School", ""));
  expect(db.create).toHaveBeenCalledWith({
    data: { name: "School", address: null },
  });
});
it.each([1, 3])(
  "protects organizations with %i active classes",
  async (count) => {
    (prisma.class.count as jest.Mock).mockResolvedValue(count);
    expect((await deleteSchoolAction(2, new FormData())).error).toMatch(
      /Cannot delete organization with/,
    );
    expect(prisma.class.count).toHaveBeenCalledWith({
      where: { schoolId: 2, isDeleted: false },
    });
    expect(db.update).not.toHaveBeenCalled();
  },
);
it("protects the last remaining organization", async () => {
  db.count.mockResolvedValue(1);
  expect((await deleteSchoolAction(2, new FormData())).error).toBe(
    "Cannot delete the last organization",
  );
  expect(db.update).not.toHaveBeenCalled();
});
it("soft-deletes an eligible organization", async () => {
  expect(await deleteSchoolAction(2, new FormData())).toEqual({ error: "" });
  expect(db.update).toHaveBeenCalledWith({
    where: { id: 2 },
    data: { isDeleted: true },
  });
  expect(logAudit).toHaveBeenCalledWith(
    expect.objectContaining({ action: "DELETE", entityId: 2 }),
  );
  expect(revalidatePath).toHaveBeenCalledWith("/dashboard/organizations");
});
it("rejects invalid IDs without querying classes", async () => {
  expect((await deleteSchoolAction(0, new FormData())).error).toBe(
    "Invalid organization ID",
  );
  expect(prisma.class.count).not.toHaveBeenCalled();
});
it("requires admin access for both mutations", async () => {
  (checkSession as jest.Mock).mockRejectedValue(new Error("denied"));
  await expect(createSchoolAction({}, form())).rejects.toThrow("denied");
  await expect(deleteSchoolAction(2, new FormData())).rejects.toThrow("denied");
  expect(db.create).not.toHaveBeenCalled();
  expect(prisma.class.count).not.toHaveBeenCalled();
});

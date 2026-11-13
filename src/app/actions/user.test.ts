import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { invalidateCachePattern } from "@/lib/redis";
import { checkSession } from "@/lib/session";
import {
  createUserAction,
  deleteUserAction,
  deleteUsersAction,
  updateUserAction,
} from "./user";

jest.mock("bcryptjs", () => ({ hash: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/lib/session", () => ({ checkSession: jest.fn() }));
jest.mock("@/lib/audit", () => ({ logAudit: jest.fn() }));
jest.mock("@/lib/redis", () => ({ invalidateCachePattern: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

const db = jest.mocked(prisma.user);
function form(values: Partial<Record<string, string>> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    name: " Ada Lovelace ",
    email: " ADA@example.com ",
    password: "secret123",
    role: "STUDENT",
    ...values,
  }))
    if (value !== undefined) data.set(key, value);
  return data;
}

beforeEach(() => {
  jest.resetAllMocks();
  (checkSession as jest.Mock).mockResolvedValue({ userId: 1, role: "ADMIN" });
  (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
  db.create.mockResolvedValue({ id: 7 } as never);
  db.update.mockResolvedValue({ id: 7 } as never);
  db.findMany.mockResolvedValue([{ id: 7, email: "ada@example.com" }] as never);
});

it.each([
  { name: " " },
  { email: "invalid" },
  { password: "short" },
  { role: "OWNER" },
])(
  "rejects invalid user input %j before querying the database",
  async (values) => {
    expect((await createUserAction({}, form(values))).error).toBeTruthy();
    expect(db.findUnique).not.toHaveBeenCalled();
    expect(db.create).not.toHaveBeenCalled();
  },
);

it("normalizes identity, hashes the password, audits and invalidates cached users", async () => {
  expect(await createUserAction({}, form())).toEqual({ error: "" });
  expect(checkSession).toHaveBeenCalledWith("ADMIN");
  expect(bcrypt.hash).toHaveBeenCalledWith("secret123", 10);
  expect(db.create).toHaveBeenCalledWith({
    data: {
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "hashed-password",
      role: "STUDENT",
    },
  });
  expect(logAudit).toHaveBeenCalledWith(
    expect.objectContaining({ action: "CREATE", entityId: 7 }),
  );
  expect(revalidatePath).toHaveBeenCalledWith("/dashboard/users");
  expect(invalidateCachePattern).toHaveBeenCalledWith("users:v1:*");
});

it("rejects an email belonging to an active user", async () => {
  db.findUnique.mockResolvedValue({ id: 8, isDeleted: false } as never);
  expect((await createUserAction({}, form())).error).toBe(
    "Email already registered",
  );
  expect(bcrypt.hash).not.toHaveBeenCalled();
});

it("restores a deleted account instead of creating a duplicate", async () => {
  db.findUnique.mockResolvedValue({ id: 8, isDeleted: true } as never);
  expect(await createUserAction({}, form())).toEqual({ error: "" });
  expect(db.create).not.toHaveBeenCalled();
  expect(db.update).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { id: 8 },
      data: expect.objectContaining({
        isDeleted: false,
        password: "hashed-password",
      }),
    }),
  );
  expect(logAudit).toHaveBeenCalledWith(
    expect.objectContaining({ action: "RESTORE", entityId: 8 }),
  );
});

it("prevents an administrator from changing their own role", async () => {
  db.findUnique.mockResolvedValueOnce({ role: "ADMIN" } as never);
  expect((await updateUserAction(1, {}, form())).error).toBe(
    "You cannot change your own role",
  );
  expect(db.update).not.toHaveBeenCalled();
});

it("rejects an update when another account owns the email", async () => {
  db.findUnique.mockResolvedValue({ id: 8, isDeleted: false } as never);
  expect((await updateUserAction(7, {}, form())).error).toBe(
    "Email already registered",
  );
  expect(db.update).not.toHaveBeenCalled();
});

it("preserves the password when an update leaves it blank", async () => {
  db.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
    name: "Old",
    email: "old@example.com",
    role: "STUDENT",
  } as never);
  expect(await updateUserAction(7, {}, form({ password: "" }))).toEqual({
    error: "",
  });
  expect(db.update).toHaveBeenCalledWith({
    where: { id: 7 },
    data: { name: "Ada Lovelace", email: "ada@example.com", role: "STUDENT" },
  });
  expect(bcrypt.hash).not.toHaveBeenCalled();
  expect(logAudit).toHaveBeenCalledWith(
    expect.objectContaining({
      metadata: {
        changes: [
          { field: "name", previous: "Old", next: "Ada Lovelace" },
          {
            field: "email",
            previous: "old@example.com",
            next: "ada@example.com",
          },
        ],
      },
    }),
  );
});

it("hashes a replacement password", async () => {
  await updateUserAction(7, {}, form({ password: "replacement123" }));
  expect(bcrypt.hash).toHaveBeenCalledWith("replacement123", 10);
  expect(db.update).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({ password: "hashed-password" }),
    }),
  );
});

it.each([0, -1, 1.5])("rejects invalid user id %s", async (id) => {
  expect((await updateUserAction(id, {}, form())).error).toBe(
    "Invalid user ID",
  );
  expect((await deleteUserAction(id, new FormData())).error).toBe(
    "Invalid user ID",
  );
  expect(db.update).not.toHaveBeenCalled();
});

it("prevents self-deletion, including a mixed bulk selection", async () => {
  expect((await deleteUserAction(1, new FormData())).error).toMatch(
    /own account/,
  );
  expect((await deleteUsersAction([7, 1])).error).toMatch(/own account/);
  expect(db.update).not.toHaveBeenCalled();
  expect(db.updateMany).not.toHaveBeenCalled();
});

it("soft-deletes a user and invalidates the users cache", async () => {
  db.findUnique.mockResolvedValue({ email: "ada@example.com" } as never);
  expect(await deleteUserAction(7, new FormData())).toEqual({ error: "" });
  expect(db.update).toHaveBeenCalledWith({
    where: { id: 7 },
    data: { isDeleted: true },
  });
  expect(logAudit).toHaveBeenCalledWith(
    expect.objectContaining({ action: "DELETE", entityId: 7 }),
  );
  expect(invalidateCachePattern).toHaveBeenCalledWith("users:v1:*");
});

it("deduplicates and validates bulk deletion IDs", async () => {
  expect(await deleteUsersAction([7, 7, 0, -2, 1.5])).toEqual({ error: "" });
  expect(db.updateMany).toHaveBeenCalledWith({
    where: { id: { in: [7] } },
    data: { isDeleted: true },
  });
  expect(logAudit).toHaveBeenCalledTimes(1);
});

it("rejects an empty bulk selection", async () => {
  expect((await deleteUsersAction([])).error).toBe("No users selected");
  expect(db.updateMany).not.toHaveBeenCalled();
});

it("does not query or mutate users when access is denied", async () => {
  (checkSession as jest.Mock).mockRejectedValue(new Error("denied"));
  await expect(createUserAction({}, form())).rejects.toThrow("denied");
  await expect(updateUserAction(7, {}, form())).rejects.toThrow("denied");
  await expect(deleteUserAction(7, new FormData())).rejects.toThrow("denied");
  await expect(deleteUsersAction([7])).rejects.toThrow("denied");
  expect(db.findUnique).not.toHaveBeenCalled();
  expect(db.updateMany).not.toHaveBeenCalled();
});

it("returns a useful error on a failed write without reporting success", async () => {
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    db.create.mockRejectedValueOnce(new Error("database unavailable"));
    expect((await createUserAction({}, form())).error).toBe(
      "Failed to create user",
    );
    expect(logAudit).not.toHaveBeenCalled();
    expect(invalidateCachePattern).not.toHaveBeenCalled();
  } finally {
    log.mockRestore();
  }
});

import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";
import { PAGE_SIZE } from "./constants";
import { fetchUsersData } from "./fetch-users";

jest.mock("@/lib/prisma", () => ({
  prisma: { user: { count: jest.fn(), findMany: jest.fn() } },
}));
jest.mock("@/lib/redis", () => ({ getRedisClient: jest.fn() }));
const cache = { get: jest.fn(), setex: jest.fn() };
const db = jest.mocked(prisma.user);
const user = {
  id: 3,
  name: "Ada",
  email: "ada@example.com",
  role: "STUDENT",
  createdAt: new Date("2026-10-25T09:00:00Z"),
};
const row = {
  id: 3,
  name: "Ada",
  email: "ada@example.com",
  role: "STUDENT",
  joinedAt: user.createdAt.toISOString(),
};
beforeEach(() => {
  jest.resetAllMocks();
  (getRedisClient as jest.Mock).mockReturnValue(cache);
  cache.get.mockResolvedValue(null);
  db.count.mockResolvedValue(1);
  db.findMany.mockResolvedValue([user] as never);
});

it("excludes deleted users and returns serializable rows for the table and export", async () => {
  const result = await fetchUsersData({});
  expect(result).toEqual({
    rows: [row],
    allRows: [row],
    total: 1,
    page: 1,
    totalPages: 1,
    q: "",
    role: null,
    after: "",
    before: "",
  });
  expect(db.count).toHaveBeenCalledWith({ where: { isDeleted: false } });
  expect(db.findMany).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      where: { isDeleted: false },
      skip: 0,
      take: PAGE_SIZE,
    }),
  );
  expect(db.findMany).toHaveBeenNthCalledWith(
    2,
    expect.not.objectContaining({ take: expect.anything() }),
  );
  expect(cache.setex).toHaveBeenCalledWith(
    expect.stringContaining("users:v1:"),
    60,
    expect.any(String),
  );
});
it("normalizes search, role, and inclusive date filters", async () => {
  await fetchUsersData({
    q: [" Ada ", "ignored"],
    role: "student",
    after: "2026-10-01",
    before: "2026-10-25",
  });
  expect(db.count).toHaveBeenCalledWith({
    where: {
      isDeleted: false,
      role: "STUDENT",
      createdAt: {
        gte: new Date("2026-10-01T00:00:00"),
        lt: new Date("2026-10-26T00:00:00"),
      },
      OR: [
        { name: { contains: "Ada", mode: "insensitive" } },
        { email: { contains: "Ada", mode: "insensitive" } },
      ],
    },
  });
});
it("supports searching for a role name", async () => {
  await fetchUsersData({ q: "mentor" });
  expect(db.count).toHaveBeenCalledWith(
    expect.objectContaining({
      where: expect.objectContaining({
        OR: expect.arrayContaining([{ role: "MENTOR" }]),
      }),
    }),
  );
});
it("ignores unsupported roles and malformed date formats and limits search length", async () => {
  const result = await fetchUsersData({
    q: "a".repeat(150),
    role: "OWNER",
    after: "yesterday",
    before: "25/10/2026",
  });
  expect(result.q).toHaveLength(100);
  expect(result.role).toBeNull();
  expect(result.after).toBe("");
  expect(result.before).toBe("");
});
it.each(["-1", "1.5", "invalid"])(
  "defaults invalid page %s to page one",
  async (page) => {
    expect((await fetchUsersData({ page })).page).toBe(1);
  },
);
it("clamps a page beyond the last result page", async () => {
  db.count.mockResolvedValue(PAGE_SIZE + 1);
  const result = await fetchUsersData({ page: "999" });
  expect(result.page).toBe(2);
  expect(db.findMany).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({ skip: PAGE_SIZE, take: PAGE_SIZE }),
  );
});
it("uses cached count, rows, and export rows without querying the database", async () => {
  cache.get.mockImplementation(async (key: string) =>
    key.endsWith(":count") ? "1" : JSON.stringify([row]),
  );
  expect((await fetchUsersData({})).rows).toEqual([row]);
  expect(db.count).not.toHaveBeenCalled();
  expect(db.findMany).not.toHaveBeenCalled();
});
it("falls back to the database when Redis is unavailable", async () => {
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    cache.get.mockRejectedValue(new Error("offline"));
    expect((await fetchUsersData({})).rows).toEqual([row]);
    expect(db.count).toHaveBeenCalledTimes(1);
    expect(db.findMany).toHaveBeenCalledTimes(2);
  } finally {
    log.mockRestore();
  }
});
it("recovers from malformed cached rows", async () => {
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    cache.get.mockImplementation(async (key: string) =>
      key.endsWith(":count") ? "1" : "not-json",
    );
    expect((await fetchUsersData({})).allRows).toEqual([row]);
    expect(db.findMany).toHaveBeenCalledTimes(2);
  } finally {
    log.mockRestore();
  }
});

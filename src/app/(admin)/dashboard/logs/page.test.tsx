import { render, screen } from "@testing-library/react";
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";
import { DEFAULT_PAGE_SIZE } from "./constants";
import LogsDataTable from "./data-table";
import LogsPage from "./page";

jest.mock("@/lib/prisma", () => ({
  prisma: { auditLog: { count: jest.fn(), findMany: jest.fn() } },
}));
jest.mock("@/lib/redis", () => ({ getRedisClient: jest.fn() }));
jest.mock("@/components/back-forward-buttons", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("./data-table", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));
const cache = { get: jest.fn(), setex: jest.fn() };
const db = jest.mocked(prisma.auditLog);
const table = jest.mocked(LogsDataTable);
const log = {
  id: 1,
  action: "UPDATE",
  entityType: "User",
  entityId: 3,
  description: "Updated Ada",
  metadata: { changes: [{ field: "name", previous: "Old", next: "Ada" }] },
  actor: { name: "Admin", email: "admin@example.com" },
  createdAt: new Date("2026-10-25T09:00:00Z"),
};
async function load(params: Record<string, string | string[]> = {}) {
  render(await LogsPage({ searchParams: Promise.resolve(params) }));
  return table.mock.calls[0][0];
}
beforeEach(() => {
  jest.resetAllMocks();
  (getRedisClient as jest.Mock).mockReturnValue(cache);
  cache.get.mockResolvedValue(null);
  db.count.mockResolvedValue(1);
  db.findMany.mockResolvedValue([log] as never);
});

it("renders read-only activity logs with actor and change details", async () => {
  const props = await load();
  expect(
    screen.getByRole("heading", { name: "Activity logs 1" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/Logs are read-only/)).toBeInTheDocument();
  expect(props.data[0]).toEqual(
    expect.objectContaining({
      id: 1,
      title: "Updated Ada",
      actorName: "Admin",
      description: "Updated name for this account.",
      loggedDay: "2026-10-25",
      changes: log.metadata.changes,
    }),
  );
  expect(cache.setex).toHaveBeenCalledWith(
    expect.stringContaining("logs:v1:"),
    60,
    expect.any(String),
  );
});
it("applies action, search and inclusive date filters", async () => {
  const props = await load({
    action: "UPDATE",
    q: [" Ada ", "ignored"],
    after: "2026-10-01",
    before: "2026-10-25",
  });
  expect(props.initialSearch).toBe("Ada");
  expect(db.count).toHaveBeenCalledWith({
    where: {
      action: "UPDATE",
      createdAt: {
        gte: new Date("2026-10-01T00:00:00"),
        lt: new Date("2026-10-26T00:00:00"),
      },
      OR: [
        { description: { contains: "Ada", mode: "insensitive" } },
        { entityType: { contains: "Ada", mode: "insensitive" } },
        {
          actor: {
            is: {
              OR: [
                { name: { contains: "Ada", mode: "insensitive" } },
                { email: { contains: "Ada", mode: "insensitive" } },
              ],
            },
          },
        },
      ],
    },
  });
});
it("defaults invalid filters and page size", async () => {
  const props = await load({
    action: "INVALID",
    after: "yesterday",
    before: "bad",
    size: "999",
    page: "-1",
  });
  expect(props).toEqual(
    expect.objectContaining({
      currentAction: "All actions",
      after: "",
      before: "",
      pageSize: DEFAULT_PAGE_SIZE,
      page: 1,
    }),
  );
});
it("clamps an out-of-range page to the last page", async () => {
  db.count.mockResolvedValue(DEFAULT_PAGE_SIZE + 1);
  expect((await load({ page: "999" })).page).toBe(2);
  expect(db.findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      skip: DEFAULT_PAGE_SIZE,
      take: DEFAULT_PAGE_SIZE,
    }),
  );
});
it("serves cached logs without querying the database", async () => {
  cache.get.mockImplementation(async (key: string) =>
    key.endsWith(":count")
      ? "1"
      : JSON.stringify([{ id: 99, title: "Cached event" }]),
  );
  expect((await load()).data).toEqual([{ id: 99, title: "Cached event" }]);
  expect(db.count).not.toHaveBeenCalled();
  expect(db.findMany).not.toHaveBeenCalled();
});
it("falls back to the database if Redis is unavailable", async () => {
  const error = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    cache.get.mockRejectedValue(new Error("offline"));
    expect((await load()).data[0].title).toBe("Updated Ada");
    expect(db.count).toHaveBeenCalledTimes(1);
    expect(db.findMany).toHaveBeenCalledTimes(1);
  } finally {
    error.mockRestore();
  }
});
it("tolerates missing descriptions and malformed change entries", async () => {
  db.findMany.mockResolvedValue([
    {
      ...log,
      action: "CREATE",
      entityType: "Class",
      description: null,
      metadata: { changes: [null, "bad", { field: "name", next: "Robotics" }] },
      actor: { name: null, email: "admin@example.com" },
    },
  ] as never);
  const props = await load();
  expect(props.data[0]).toEqual(
    expect.objectContaining({
      title: "Created Class #3",
      actorName: "Unnamed",
      description: "Added a new class record.",
      changes: [{ field: "name", previous: "—", next: "Robotics" }],
    }),
  );
});

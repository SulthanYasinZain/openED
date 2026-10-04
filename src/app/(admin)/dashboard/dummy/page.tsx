// biome-ignore-all lint/a11y/useButtonType: throwaway visual mock, buttons are non-functional by design
"use client";

import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowLeftDoubleIcon,
  ArrowRight01Icon,
  ArrowRightDoubleIcon,
  Briefcase01Icon,
  Calendar01Icon,
  Delete01Icon,
  Download01Icon,
  KanbanIcon,
  ListViewIcon,
  Mail01Icon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
  PlusSignIcon,
  Search01Icon,
  Settings02Icon,
  Shield01Icon,
  SlidersHorizontalIcon,
  Table01Icon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const users = [
  [
    "Liam Smith",
    "smith@example.com",
    "Project Manager",
    "Active",
    "24 Jun 2024, 9:23 pm",
    "purple",
  ],
  [
    "Noah Anderson",
    "anderson@example.com",
    "UX Designer",
    "Active",
    "15 Mar 2023, 2:45 pm",
    "cyan",
  ],
  [
    "Isabella Garcia",
    "garcia@example.com",
    "Front-End Developer",
    "Inactive",
    "10 Apr 2022, 11:30 am",
    "pink",
  ],
  [
    "William Clark",
    "clark@example.com",
    "Product Owner",
    "Active",
    "28 Feb 2023, 6:15 pm",
    "blue",
  ],
  [
    "James Hall",
    "hall@example.com",
    "Business Analyst",
    "Active",
    "19 May 2024, 7:55 am",
    "orange",
  ],
  [
    "Benjamin Lewis",
    "lewis@example.com",
    "Data Analyst",
    "Active",
    "03 Jan 2024, 12:05 pm",
    "yellow",
  ],
  [
    "Amelia Davis",
    "davis@example.com",
    "UX Designer",
    "Inactive",
    "21 Jul 2023, 8:40 pm",
    "violet",
  ],
  [
    "Emma Johnson",
    "johnson@example.com",
    "UX Designer",
    "Active",
    "16 Sep 2023, 3:25 pm",
    "green",
  ],
  [
    "Olivia Brown",
    "brown@example.com",
    "Marketing Specialist",
    "Active",
    "04 Nov 2022, 9:50 am",
    "teal",
  ],
  [
    "Ava Williams",
    "williams@example.com",
    "Software Engineer",
    "Active",
    "30 Dec 2023, 4:35 pm",
    "red",
  ],
  [
    "Sophie Jones",
    "jones@example.com",
    "Front-End Developer",
    "Active",
    "05 Jun 2023, 7:10 pm",
    "lavender",
  ],
  [
    "Mia Miller",
    "miller@example.com",
    "Security Analyst",
    "Inactive",
    "12 Aug 2022, 1:00 pm",
    "plum",
  ],
  [
    "Lucas Young",
    "young@example.com",
    "Front-End Developer",
    "Active",
    "17 Oct 2023, 10:20 am",
    "aqua",
  ],
  [
    "Alexander Wright",
    "wright@example.com",
    "DevOps Engineer",
    "Active",
    "08 Feb 2023, 5:45 pm",
    "blue",
  ],
  [
    "Harper Martinez",
    "martinez@example.com",
    "System Architect",
    "Active",
    "27 Jul 2024, 6:30 am",
    "pink",
  ],
];

const AVATAR_STYLES: Record<string, string> = {
  purple: "bg-purple-100 text-purple-700",
  cyan: "bg-cyan-100 text-cyan-700",
  pink: "bg-pink-100 text-pink-700",
  blue: "bg-blue-100 text-blue-700",
  orange: "bg-orange-100 text-orange-700",
  yellow: "bg-yellow-100 text-yellow-700",
  violet: "bg-violet-100 text-violet-700",
  green: "bg-green-100 text-green-700",
  teal: "bg-teal-100 text-teal-700",
  red: "bg-red-100 text-red-700",
  lavender: "bg-indigo-100 text-indigo-700",
  plum: "bg-fuchsia-100 text-fuchsia-700",
  aqua: "bg-sky-100 text-sky-700",
};

function avatarClass(color: string) {
  return `inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${AVATAR_STYLES[color] ?? "bg-stone-100 text-stone-700"}`;
}

function userInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export default function Page() {
  const [role, setRole] = useState<string | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [activeView, setActiveView] = useState<"Table" | "Board" | "List">(
    "Table",
  );
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [density, setDensity] = useState<"comfortable" | "compact">(
    "comfortable",
  );

  const toggle = (id: number) =>
    setSelected((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id],
    );

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 text-[13px] text-stone-900">
      <section>
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-0.5">
            <div className="flex items-center">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-1 text-stone-600 hover:bg-stone-100"
                aria-label="Go back"
              >
                <HugeiconsIcon
                  icon={ArrowLeft01Icon}
                  size={15}
                  strokeWidth={2}
                />
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-1 text-stone-600 hover:bg-stone-100"
                aria-label="Go forward"
              >
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={15}
                  strokeWidth={2}
                />
              </button>
            </div>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink render={<span>Ventures</span>} />
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    <span className="inline-flex items-center gap-1.5">
                      <HugeiconsIcon
                        icon={UserGroupIcon}
                        size={12}
                        strokeWidth={2}
                      />
                      User management
                    </span>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div>
          <h1 className="inline-flex items-center gap-1.5 text-xl font-semibold tracking-tight">
            User management{" "}
            <sup className="text-muted-foreground text-sm font-normal">74</sup>
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Manage your team members and their account permissions here.
          </p>
        </div>
        <Tabs
          value={activeView}
          onValueChange={(value) =>
            setActiveView(value as "Table" | "Board" | "List")
          }
        >
          <div className="border-border mt-4 flex flex-wrap items-center gap-1 border-t pt-2.5">
            <TabsList variant="line">
              <TabsTrigger value="Table">
                <HugeiconsIcon
                  icon={Table01Icon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                Table
              </TabsTrigger>
              <TabsTrigger value="Board">
                <HugeiconsIcon
                  icon={KanbanIcon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                Board
              </TabsTrigger>
              <TabsTrigger value="List">
                <HugeiconsIcon
                  icon={ListViewIcon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                List
              </TabsTrigger>
            </TabsList>
            <div className="ml-auto flex flex-wrap items-center gap-0.5">
              <Button type="button" variant="ghost" size="sm">
                <HugeiconsIcon
                  icon={Search01Icon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                Search
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button type="button" variant="ghost" size="sm">
                      <HugeiconsIcon
                        icon={SlidersHorizontalIcon}
                        strokeWidth={2}
                        data-icon="inline-start"
                      />
                      Hide
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  {["Email", "Role", "Joined date"].map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column}
                      className="px-4 py-2.5"
                      checked={hiddenColumns.includes(column)}
                      onCheckedChange={(value) =>
                        setHiddenColumns((items) =>
                          value
                            ? [...items, column]
                            : items.filter((item) => item !== column),
                        )
                      }
                    >
                      {column}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button type="button" variant="ghost" size="sm">
                      <HugeiconsIcon
                        icon={Settings02Icon}
                        strokeWidth={2}
                        data-icon="inline-start"
                      />
                      Customize
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup
                    value={density}
                    onValueChange={(value) =>
                      setDensity(value as "compact" | "comfortable")
                    }
                  >
                    <DropdownMenuRadioItem
                      value="compact"
                      className="px-4 py-2.5"
                    >
                      Compact density
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="comfortable"
                      className="px-4 py-2.5"
                    >
                      Comfortable density
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="px-4 py-2.5"
                    onClick={() => {
                      setDensity("comfortable");
                      setHiddenColumns([]);
                    }}
                  >
                    Reset view
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button type="button" variant="outline" size="sm">
                <HugeiconsIcon
                  icon={Download01Icon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                Export
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button type="button" variant="outline" size="sm">
                      Add User{" "}
                      <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        strokeWidth={2}
                        data-icon="inline-end"
                      />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="px-4 py-2.5">
                    Invite by email
                  </DropdownMenuItem>
                  <DropdownMenuItem className="px-4 py-2.5">
                    Import users
                  </DropdownMenuItem>
                  <DropdownMenuItem className="px-4 py-2.5">
                    Create manually
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger size="sm" className="rounded-full!">
                <HugeiconsIcon
                  icon={Shield01Icon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent align="start" alignItemWithTrigger={false}>
                {["All roles", "Project Manager", "UX Designer"].map(
                  (option) => (
                    <SelectItem
                      key={option}
                      value={option}
                      className="px-4 py-2.5"
                    >
                      {option}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            <Button type="button" variant="ghost" size="sm">
              <HugeiconsIcon
                icon={PlusSignIcon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Add filter
            </Button>
          </div>
          {activeView === "Table" && (
            <div className="border-border mt-3 overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        aria-label="Select all"
                        checked={selected.length === users.length}
                        indeterminate={
                          selected.length > 0 && selected.length < users.length
                        }
                        onCheckedChange={(value) =>
                          setSelected(value ? users.map((_, i) => i) : [])
                        }
                      />
                    </TableHead>
                    <TableHead>
                      <span className="inline-flex items-center gap-1.5">
                        <HugeiconsIcon
                          icon={UserIcon}
                          size={14}
                          strokeWidth={2}
                        />
                        Full name
                      </span>
                    </TableHead>
                    {!hiddenColumns.includes("Email") && (
                      <TableHead>
                        <span className="inline-flex items-center gap-1.5">
                          <HugeiconsIcon
                            icon={Mail01Icon}
                            size={14}
                            strokeWidth={2}
                          />
                          Email
                        </span>
                      </TableHead>
                    )}
                    {!hiddenColumns.includes("Role") && (
                      <TableHead>
                        <span className="inline-flex items-center gap-1.5">
                          <HugeiconsIcon
                            icon={Briefcase01Icon}
                            size={14}
                            strokeWidth={2}
                          />
                          Role
                        </span>
                      </TableHead>
                    )}
                    {!hiddenColumns.includes("Joined date") && (
                      <TableHead>
                        <span className="inline-flex items-center gap-1.5">
                          <HugeiconsIcon
                            icon={Calendar01Icon}
                            size={14}
                            strokeWidth={2}
                          />
                          Joined date
                        </span>
                      </TableHead>
                    )}
                    <TableHead className="text-right">
                      <span className="inline-flex items-center justify-end gap-1.5">
                        <HugeiconsIcon
                          icon={Settings02Icon}
                          size={14}
                          strokeWidth={2}
                        />
                        Actions
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, i) => (
                    <TableRow key={user[0]}>
                      <TableCell>
                        <Checkbox
                          aria-label={`Select ${user[0]}`}
                          checked={selected.includes(i)}
                          onCheckedChange={() => toggle(i)}
                        />
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-2.5">
                          <span
                            className={avatarClass(user[5])}
                            aria-hidden="true"
                          >
                            {userInitials(user[0])}
                          </span>
                          <span className="font-medium">{user[0]}</span>
                        </span>
                      </TableCell>
                      {!hiddenColumns.includes("Email") && (
                        <TableCell>
                          <a
                            href={`mailto:${user[1]}`}
                            className="text-muted-foreground"
                          >
                            {user[1]}
                          </a>
                        </TableCell>
                      )}
                      {!hiddenColumns.includes("Role") && (
                        <TableCell>{user[2]}</TableCell>
                      )}
                      {!hiddenColumns.includes("Joined date") && (
                        <TableCell className="whitespace-nowrap">
                          {user[4]}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" size="sm">
                            <HugeiconsIcon
                              icon={PencilEdit01Icon}
                              strokeWidth={2}
                              data-icon="inline-start"
                            />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-500"
                          >
                            <HugeiconsIcon
                              icon={Delete01Icon}
                              strokeWidth={2}
                              data-icon="inline-start"
                            />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {activeView === "Board" && (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
              <section className="w-64 shrink-0 rounded-lg border border-stone-200 bg-stone-50 p-2.5">
                <div className="flex items-center justify-between px-1 pb-2">
                  <h3 className="text-[13px] font-semibold">Team</h3>
                  <span className="text-xs text-stone-500">
                    {users.length} users
                  </span>
                </div>
                {users.map((user) => {
                  const index = users.indexOf(user);
                  return (
                    <article
                      className={`mb-2 rounded-lg border bg-white p-2.5 ${selected.includes(index) ? "border-stone-900" : "border-stone-200"}`}
                      key={user[0]}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          aria-label={`Select ${user[0]}`}
                          checked={selected.includes(index)}
                          onChange={() => toggle(index)}
                          className="size-3.5 accent-stone-900"
                        />
                        <span
                          className={avatarClass(user[5])}
                          aria-hidden="true"
                        >
                          {userInitials(user[0])}
                        </span>
                        <div>
                          <strong className="block text-xs">{user[0]}</strong>
                          <small className="block text-xs text-stone-500">
                            {user[2]}
                          </small>
                        </div>
                        <button
                          className="ml-auto text-stone-500 hover:text-stone-900"
                          aria-label="More actions"
                        >
                          <HugeiconsIcon
                            icon={MoreHorizontalIcon}
                            size={14}
                            strokeWidth={2}
                          />
                        </button>
                      </div>
                      <div className="mt-2 flex flex-col gap-1 text-xs text-stone-600">
                        <a href={`mailto:${user[1]}`}>{user[1]}</a>
                        <span>{user[4]}</span>
                      </div>
                      <div className="mt-2 flex gap-1.5">
                        <button className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-xs hover:bg-stone-100">
                          <HugeiconsIcon
                            icon={PencilEdit01Icon}
                            size={12}
                            strokeWidth={2}
                          />
                          Edit
                        </button>
                        <button className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-xs hover:bg-stone-100">
                          <HugeiconsIcon
                            icon={Delete01Icon}
                            size={12}
                            strokeWidth={2}
                          />
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </section>
            </div>
          )}
          {activeView === "List" && (
            <div className="mt-3 divide-y divide-stone-100 rounded-lg border border-stone-200">
              {users.map((user, i) => (
                <div
                  className={`flex items-center gap-2.5 px-3 py-2 ${selected.includes(i) ? "bg-stone-100" : ""}`}
                  key={user[0]}
                >
                  <input
                    type="checkbox"
                    aria-label={`Select ${user[0]}`}
                    checked={selected.includes(i)}
                    onChange={() => toggle(i)}
                    className="size-3.5 accent-stone-900"
                  />
                  <span className={avatarClass(user[5])} aria-hidden="true">
                    {userInitials(user[0])}
                  </span>
                  <div>
                    <strong className="block text-[13px]">{user[0]}</strong>
                    <small className="block text-xs text-stone-500">
                      {user[2]}
                    </small>
                  </div>
                  <a href={`mailto:${user[1]}`} className="text-stone-600">
                    {user[1]}
                  </a>
                  <span>{user[4]}</span>
                  <div className="ml-auto flex gap-1.5">
                    <button className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-xs hover:bg-stone-100">
                      <HugeiconsIcon
                        icon={PencilEdit01Icon}
                        size={12}
                        strokeWidth={2}
                      />
                      Edit
                    </button>
                    <button className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-xs hover:bg-stone-100">
                      <HugeiconsIcon
                        icon={Delete01Icon}
                        size={12}
                        strokeWidth={2}
                      />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Tabs>
        <footer className="mt-3 flex flex-wrap items-center gap-3 text-xs text-stone-500">
          <div>
            Rows per page{" "}
            <button className="ml-1 inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-0.5">
              15{" "}
              <HugeiconsIcon icon={ArrowDown01Icon} size={12} strokeWidth={2} />
            </button>
            <span className="ml-2">1â€“15 of 380 rows</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button
              aria-label="First page"
              className="inline-flex h-6 min-w-6 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100"
            >
              <HugeiconsIcon
                icon={ArrowLeftDoubleIcon}
                size={13}
                strokeWidth={2}
              />
            </button>
            <button
              aria-label="Previous page"
              className="inline-flex h-6 min-w-6 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={13} strokeWidth={2} />
            </button>
            <button className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-stone-900 text-white">
              1
            </button>
            <button
              onClick={() => setPage(2)}
              className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md hover:bg-stone-100 ${page === 2 ? "bg-stone-900 text-white" : "text-stone-600"}`}
            >
              2
            </button>
            <span>â€¦</span>
            <button className="inline-flex h-6 min-w-6 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100">
              5
            </button>
            <button
              aria-label="Next page"
              className="inline-flex h-6 min-w-6 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100"
            >
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={13}
                strokeWidth={2}
              />
            </button>
            <button
              aria-label="Last page"
              className="inline-flex h-6 min-w-6 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100"
            >
              <HugeiconsIcon
                icon={ArrowRightDoubleIcon}
                size={13}
                strokeWidth={2}
              />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

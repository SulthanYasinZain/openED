import { fireEvent, render, screen } from "@testing-library/react";
import ScheduleCalendar from "./schedule-calendar";
import ScheduleGantt, { dayKey } from "./schedule-gantt";

const meetings = [
  {
    id: 1,
    topic: "Afternoon",
    className: "Robotics",
    scheduledAt: new Date(2026, 9, 25, 14).toISOString(),
  },
  {
    id: 2,
    topic: "Morning",
    className: "Design",
    scheduledAt: new Date(2026, 9, 25, 9).toISOString(),
  },
  {
    id: 3,
    topic: "Next week lesson",
    className: "Robotics",
    scheduledAt: new Date(2026, 10, 1, 10).toISOString(),
  },
];
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 9, 25, 12));
});
afterEach(() => {
  jest.useRealTimers();
});

it("uses local calendar dates for schedule grouping", () => {
  expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
});
it("lists today's calendar meetings in chronological order", () => {
  render(<ScheduleCalendar meetings={meetings} />);
  expect(
    screen.getByRole("heading", { name: "October 2026" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "25, 2 scheduled" }),
  ).toBeInTheDocument();
  const items = screen.getAllByRole("listitem");
  expect(items[0]).toHaveTextContent("Morning · Design");
  expect(items[1]).toHaveTextContent("Afternoon · Robotics");
  expect(screen.queryByText(/Next week lesson/)).not.toBeInTheDocument();
});
it("selects a different calendar day and displays an empty state", () => {
  render(<ScheduleCalendar meetings={meetings} />);
  fireEvent.click(screen.getByRole("button", { name: "26" }));
  expect(screen.getByText("No meetings this day.")).toBeInTheDocument();
  expect(screen.queryByRole("list")).not.toBeInTheDocument();
});
it("navigates calendar months and selects scheduled days in the new month", () => {
  render(<ScheduleCalendar meetings={meetings} />);
  fireEvent.click(screen.getByRole("button", { name: "Next month" }));
  expect(
    screen.getByRole("heading", { name: "November 2026" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "1, 1 scheduled" }));
  expect(screen.getByText("Next week lesson · Robotics")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
  expect(
    screen.getByRole("heading", { name: "October 2026" }),
  ).toBeInTheDocument();
});
it("limits the weekly schedule to its selected week and returns to today", () => {
  render(<ScheduleGantt meetings={meetings} />);
  expect(
    screen.getByRole("heading", { name: "This week" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Morning")).toBeInTheDocument();
  expect(screen.queryByText("Next week lesson")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Next week" }));
  expect(screen.getByText("Next week lesson")).toBeInTheDocument();
  expect(screen.queryByText("Morning")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Today" }));
  expect(screen.getByText("Morning")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Previous week" }));
  expect(screen.getByText("Nothing scheduled this week.")).toBeInTheDocument();
});
it("keeps overlapping meetings in separate lanes", () => {
  render(
    <ScheduleGantt
      meetings={[
        meetings[1],
        {
          ...meetings[1],
          id: 4,
          topic: "Overlapping",
          scheduledAt: new Date(2026, 9, 25, 9, 30).toISOString(),
        },
      ]}
    />,
  );
  const first = screen.getByTitle(/^Morning ·/);
  const second = screen.getByTitle(/^Overlapping ·/);
  expect(first.style.left).not.toBe(second.style.left);
  expect(first.style.width).toBe(second.style.width);
  expect(first.style.width).toContain("50%");
});

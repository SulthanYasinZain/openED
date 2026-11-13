import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { saveMeetingAttendanceAction } from "@/app/actions/attendance";
import MarkAttendance from "./mark-attendance";

jest.mock("@/app/actions/attendance", () => ({
  saveMeetingAttendanceAction: jest.fn(),
}));
const save = jest.mocked(saveMeetingAttendanceAction);
const props = {
  classCode: "ABC123",
  meetingId: 7,
  topic: "Introduction",
  className: "Robotics",
  scheduledAt: "2026-10-25T09:00:00Z",
  dateLabel: "Sunday, 25 October 2026",
  timeLabel: "09:00",
  students: [
    {
      studentId: 3,
      name: "Ada Lovelace",
      email: "ada@example.com",
      status: "PRESENT" as const,
      note: "",
    },
    {
      studentId: 4,
      name: "Grace Hopper",
      email: "grace@example.com",
      status: "ABSENT" as const,
      note: "Sick",
    },
    {
      studentId: 5,
      name: "Lin Chen",
      email: "lin@example.com",
      status: null,
      note: "",
    },
  ],
};
function statusButton(name: string, status: string) {
  return within(
    screen.getByRole("group", { name: `Attendance for ${name}` }),
  ).getByRole("button", { name: status });
}
beforeEach(() => {
  jest.resetAllMocks();
  save.mockResolvedValue({ success: true });
});

it("renders the meeting context, existing statuses and live counts", () => {
  render(<MarkAttendance {...props} />);
  expect(
    screen.getByRole("heading", { name: "Mark attendance" }),
  ).toBeInTheDocument();
  expect(screen.getByText(props.dateLabel)).toBeInTheDocument();
  expect(screen.getByText("09:00 · Robotics")).toBeInTheDocument();
  expect(statusButton("Ada Lovelace", "Present")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(statusButton("Grace Hopper", "Absent")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(
    screen.getByText("Present", { selector: "dt" }).nextElementSibling,
  ).toHaveTextContent("1");
  expect(screen.getByText("3 of 3 students · 1 unmarked")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Save attendance" }),
  ).toBeDisabled();
});
it("updates a student's status and counts without saving immediately", async () => {
  const user = userEvent.setup();
  render(<MarkAttendance {...props} />);
  await user.click(statusButton("Lin Chen", "Late"));
  expect(statusButton("Lin Chen", "Late")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(
    screen.getByText("Late", { selector: "dt" }).nextElementSibling,
  ).toHaveTextContent("1");
  expect(
    screen.getByText("3 of 3 students · 0 unmarked · 1 unsaved"),
  ).toBeInTheDocument();
  expect(save).not.toHaveBeenCalled();
});
it("searches case-insensitively by student email", async () => {
  const user = userEvent.setup();
  render(<MarkAttendance {...props} />);
  await user.type(
    screen.getByRole("textbox", { name: "Search students" }),
    "GRACE@",
  );
  expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
  expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument();
  expect(screen.getByText("1 of 3 students · 1 unmarked")).toBeInTheDocument();
});
it("marks the entire class present even while search hides some students, preserving notes", async () => {
  const user = userEvent.setup();
  render(<MarkAttendance {...props} />);
  await user.type(
    screen.getByRole("textbox", { name: "Search students" }),
    "Ada",
  );
  await user.click(screen.getByRole("button", { name: "Mark all present" }));
  expect(
    screen.getByText("Present", { selector: "dt" }).nextElementSibling,
  ).toHaveTextContent("3");
  await user.click(screen.getByRole("button", { name: "Save attendance" }));
  expect(
    await screen.findByText("Attendance saved successfully."),
  ).toBeInTheDocument();
  expect(save).toHaveBeenCalledWith({
    classCode: "ABC123",
    meetingId: 7,
    attendance: [
      { studentId: 4, status: "PRESENT", note: "Sick" },
      { studentId: 5, status: "PRESENT", note: "" },
    ],
  });
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Save attendance" }),
    ).toBeDisabled(),
  );
});
it("saves only the edited student's status and note", async () => {
  const user = userEvent.setup();
  render(<MarkAttendance {...props} />);
  await user.click(statusButton("Ada Lovelace", "Excused"));
  await user.type(
    screen.getByRole("textbox", { name: "Note for Ada Lovelace" }),
    "Family event",
  );
  await user.click(screen.getByRole("button", { name: "Save attendance" }));
  await screen.findByText("Attendance saved successfully.");
  expect(save).toHaveBeenCalledTimes(1);
  expect(save).toHaveBeenCalledWith({
    classCode: "ABC123",
    meetingId: 7,
    attendance: [{ studentId: 3, status: "EXCUSED", note: "Family event" }],
  });
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Save attendance" }),
    ).toBeDisabled(),
  );
});
it("requires a status before saving a note for an unmarked student", async () => {
  const user = userEvent.setup();
  render(<MarkAttendance {...props} />);
  await user.type(
    screen.getByRole("textbox", { name: "Note for Lin Chen" }),
    "On the way",
  );
  await user.click(screen.getByRole("button", { name: "Save attendance" }));
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Choose an attendance status",
  );
  expect(save).not.toHaveBeenCalled();
});
it("keeps unsaved edits when the server rejects a save and permits retry", async () => {
  save.mockResolvedValueOnce({ error: "Student list changed." });
  const user = userEvent.setup();
  render(<MarkAttendance {...props} />);
  await user.click(statusButton("Ada Lovelace", "Late"));
  await user.click(screen.getByRole("button", { name: "Save attendance" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Student list changed.",
  );
  expect(statusButton("Ada Lovelace", "Late")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Save attendance" }),
    ).toBeEnabled(),
  );
  await user.click(screen.getByRole("button", { name: "Save attendance" }));
  await screen.findByText("Attendance saved successfully.");
  expect(save).toHaveBeenCalledTimes(2);
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Save attendance" }),
    ).toBeDisabled(),
  );
});
it("handles a rejected action without discarding the draft", async () => {
  save.mockRejectedValueOnce(new Error("network"));
  const user = userEvent.setup();
  render(<MarkAttendance {...props} />);
  await user.click(statusButton("Ada Lovelace", "Late"));
  await user.click(screen.getByRole("button", { name: "Save attendance" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Unable to save attendance",
  );
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Save attendance" }),
    ).toBeEnabled(),
  );
});
it("disables editing and duplicate submissions while saving", async () => {
  let finish: ((value: { success: boolean }) => void) | undefined;
  save.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const user = userEvent.setup();
  render(<MarkAttendance {...props} />);
  await user.click(statusButton("Ada Lovelace", "Late"));
  await user.click(screen.getByRole("button", { name: "Save attendance" }));
  expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
  expect(statusButton("Ada Lovelace", "Present")).toBeDisabled();
  expect(
    screen.getByRole("textbox", { name: "Note for Ada Lovelace" }),
  ).toBeDisabled();
  expect(
    screen.getByRole("button", { name: "Mark all present" }),
  ).toBeDisabled();
  expect(save).toHaveBeenCalledTimes(1);
  await act(async () => {
    finish?.({ success: true });
  });
  expect(
    screen.getByText("Attendance saved successfully."),
  ).toBeInTheDocument();
});
it("shows a helpful no-search-results state", () => {
  render(<MarkAttendance {...props} />);
  fireEvent.change(screen.getByRole("textbox", { name: "Search students" }), {
    target: { value: "unknown" },
  });
  expect(
    screen.getByText("No students match your search."),
  ).toBeInTheDocument();
});
it("handles a class with no enrolled students", () => {
  render(<MarkAttendance {...props} students={[]} />);
  expect(
    screen.getByText("No students enrolled in this class yet."),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Mark all present" }),
  ).toBeDisabled();
  expect(
    screen.getByRole("button", { name: "Save attendance" }),
  ).toBeDisabled();
});

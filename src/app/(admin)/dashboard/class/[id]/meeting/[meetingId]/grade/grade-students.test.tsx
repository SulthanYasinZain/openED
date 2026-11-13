import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { saveMeetingGradesAction } from "@/app/actions/grade";
import GradeStudents from "./grade-students";

jest.mock("@/app/actions/grade", () => ({
  saveMeetingGradesAction: jest.fn(),
}));
const save = jest.mocked(saveMeetingGradesAction);
const props = {
  classCode: "ABC123",
  meetingId: 7,
  topic: "Introduction",
  students: [
    {
      studentId: 3,
      name: "Ada Lovelace",
      email: "ada@example.com",
      programming: 80,
      creativity: 90,
      design: 100,
    },
    {
      studentId: 4,
      name: "Grace Hopper",
      email: "grace@example.com",
      programming: null,
      creativity: null,
      design: null,
    },
  ],
};
beforeEach(() => {
  jest.resetAllMocks();
  save.mockResolvedValue({ success: true });
});

it("renders saved scores and a read-only calculated final average", () => {
  render(<GradeStudents {...props} />);
  expect(
    screen.getByRole("spinbutton", { name: "Ada Lovelace Programming score" }),
  ).toHaveValue(80);
  expect(screen.getByLabelText("Ada Lovelace final average")).toHaveTextContent(
    "90",
  );
  expect(screen.getByLabelText("Ada Lovelace final average").tagName).toBe(
    "OUTPUT",
  );
  expect(screen.getByLabelText("Grace Hopper final average")).toHaveTextContent(
    "—",
  );
  expect(screen.getByRole("button", { name: "Save grades" })).toBeDisabled();
});
it("recalculates the student and category averages when a score changes", () => {
  render(<GradeStudents {...props} />);
  fireEvent.change(
    screen.getByRole("spinbutton", { name: "Ada Lovelace Programming score" }),
    { target: { value: "50" } },
  );
  expect(screen.getByLabelText("Ada Lovelace final average")).toHaveTextContent(
    "80",
  );
  expect(
    within(
      screen.getByRole("region", { name: "Programming average" }),
    ).getByText("50"),
  ).toBeInTheDocument();
  expect(save).not.toHaveBeenCalled();
});
it("saves only edited students and sends a cleared score as null", async () => {
  const user = userEvent.setup();
  render(<GradeStudents {...props} />);
  await user.clear(
    screen.getByRole("spinbutton", { name: "Ada Lovelace Programming score" }),
  );
  await user.click(screen.getByRole("button", { name: "Save grades" }));
  expect(
    await screen.findByText("Grades saved successfully."),
  ).toBeInTheDocument();
  expect(save).toHaveBeenCalledWith({
    classCode: "ABC123",
    meetingId: 7,
    grades: [{ studentId: 3, programming: null, creativity: 90, design: 100 }],
  });
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Save grades" })).toBeDisabled(),
  );
});
it("retains drafts when switching between form and spreadsheet views", async () => {
  const user = userEvent.setup();
  render(<GradeStudents {...props} />);
  fireEvent.change(
    screen.getByRole("spinbutton", { name: "Ada Lovelace Programming score" }),
    { target: { value: "75" } },
  );
  await user.click(screen.getByRole("tab", { name: "Spreadsheet" }));
  expect(screen.getByRole("tab", { name: "Spreadsheet" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await user.click(screen.getByRole("tab", { name: "Form" }));
  expect(
    screen.getByRole("spinbutton", { name: "Ada Lovelace Programming score" }),
  ).toHaveValue(75);
  expect(screen.getByLabelText("Ada Lovelace final average")).toHaveTextContent(
    "88.33",
  );
});
it("filters students by name or email without losing edits", async () => {
  const user = userEvent.setup();
  render(<GradeStudents {...props} />);
  fireEvent.change(
    screen.getByRole("spinbutton", { name: "Ada Lovelace Programming score" }),
    { target: { value: "0" } },
  );
  await user.type(
    screen.getByRole("textbox", { name: "Search students" }),
    "grace@",
  );
  expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument();
  expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
  await user.clear(screen.getByRole("textbox", { name: "Search students" }));
  expect(
    screen.getByRole("spinbutton", { name: "Ada Lovelace Programming score" }),
  ).toHaveValue(0);
});
it("filters to students who still need grading", async () => {
  render(<GradeStudents {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Filter" }));
  fireEvent.click(
    await screen.findByRole("menuitemradio", { name: "Needs grading" }),
  );
  expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
  expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument();
});
it("keeps drafts after a rejected save so the user can retry", async () => {
  save.mockResolvedValueOnce({ error: "Meeting no longer available." });
  const user = userEvent.setup();
  render(<GradeStudents {...props} />);
  fireEvent.change(
    screen.getByRole("spinbutton", { name: "Ada Lovelace Programming score" }),
    { target: { value: "75" } },
  );
  await user.click(screen.getByRole("button", { name: "Save grades" }));
  expect(
    await screen.findByText("Meeting no longer available."),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("spinbutton", { name: "Ada Lovelace Programming score" }),
  ).toHaveValue(75);
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Save grades" })).toBeEnabled(),
  );
});

import { act, fireEvent, render, screen } from "@testing-library/react";
import GradeSpreadsheet from "./grade-spreadsheet";

const rows = [
  {
    studentId: 3,
    name: "Ada",
    programming: "80",
    creativity: "90",
    design: "100",
  },
  {
    studentId: 4,
    name: "Grace",
    programming: "50",
    creativity: "60",
    design: "70",
  },
  { studentId: 5, name: "Lin", programming: "", creativity: "", design: "" },
];
const onFill = jest.fn();
const originalElementFromPoint = Object.getOwnPropertyDescriptor(
  document,
  "elementFromPoint",
);
beforeEach(() => {
  onFill.mockReset();
});
afterEach(() => {
  if (originalElementFromPoint)
    Object.defineProperty(
      document,
      "elementFromPoint",
      originalElementFromPoint,
    );
  else Reflect.deleteProperty(document, "elementFromPoint");
});
function score(name: string, category: string) {
  return screen.getByRole("textbox", {
    name: `${name} ${category} score out of 100`,
  });
}

it("routes a score edit to the correct student and category", () => {
  render(<GradeSpreadsheet rows={rows} disabled={false} onFill={onFill} />);
  fireEvent.change(score("Grace", "Programming"), { target: { value: "0" } });
  expect(onFill).toHaveBeenCalledWith([4], "programming", "0");
  expect(screen.getByLabelText("Ada final average")).toHaveTextContent("90");
  expect(screen.getByLabelText("Ada final average").tagName).toBe("OUTPUT");
});
it("moves vertically with arrows, Enter, and Shift+Enter while keeping the category", () => {
  render(<GradeSpreadsheet rows={rows} disabled={false} onFill={onFill} />);
  act(() => score("Ada", "Creativity").focus());
  fireEvent.keyDown(score("Ada", "Creativity"), { key: "ArrowDown" });
  expect(score("Grace", "Creativity")).toHaveFocus();
  fireEvent.keyDown(score("Grace", "Creativity"), { key: "Enter" });
  expect(score("Lin", "Creativity")).toHaveFocus();
  fireEvent.keyDown(score("Lin", "Creativity"), {
    key: "Enter",
    shiftKey: true,
  });
  expect(score("Grace", "Creativity")).toHaveFocus();
  fireEvent.keyDown(score("Grace", "Creativity"), { key: "ArrowUp" });
  expect(score("Ada", "Creativity")).toHaveFocus();
  fireEvent.keyDown(score("Ada", "Creativity"), { key: "ArrowUp" });
  expect(score("Ada", "Creativity")).toHaveFocus();
});
it("fills only the later visible students", () => {
  render(
    <GradeSpreadsheet
      rows={[rows[0], rows[2]]}
      disabled={false}
      onFill={onFill}
    />,
  );
  act(() => score("Ada", "Programming").focus());
  fireEvent.click(screen.getByRole("button", { name: "Fill down" }));
  expect(onFill).toHaveBeenCalledWith([5], "programming", "80");
});
it("does not apply a stale selection to another student after filtering", () => {
  const { rerender } = render(
    <GradeSpreadsheet rows={rows} disabled={false} onFill={onFill} />,
  );
  act(() => score("Ada", "Programming").focus());
  rerender(
    <GradeSpreadsheet
      rows={[rows[1], rows[2]]}
      disabled={false}
      onFill={onFill}
    />,
  );
  expect(screen.getByRole("button", { name: "Fill down" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Fill down" }));
  expect(onFill).not.toHaveBeenCalled();
});

it.each([
  {
    direction: "horizontally",
    row: 1,
    column: 2,
    ids: [4],
    categories: ["creativity", "design"],
  },
  {
    direction: "vertically",
    row: 2,
    column: 1,
    ids: [4, 5],
    categories: ["creativity"],
  },
  {
    direction: "diagonally",
    row: 2,
    column: 2,
    ids: [4, 5],
    categories: ["creativity", "design"],
  },
  {
    direction: "up and left",
    row: 0,
    column: 0,
    ids: [3, 4],
    categories: ["programming", "creativity"],
  },
  {
    direction: "over the read-only average",
    row: 2,
    column: 3,
    ids: [4, 5],
    categories: ["creativity", "design"],
  },
])(
  "copies a rectangular range $direction without writing a final average",
  ({ row, column, ids, categories }) => {
    const { container } = render(
      <GradeSpreadsheet rows={rows} disabled={false} onFill={onFill} />,
    );
    act(() => score("Grace", "Creativity").focus());
    const handle = screen.getByRole("button", {
      name: /Drag to copy Creativity/,
    });
    handle.setPointerCapture = jest.fn();
    const target = container.querySelector<HTMLElement>(
      `[data-grade-row="${row}"][data-grade-column="${column}"]`,
    );
    if (!target) throw new Error("Expected a spreadsheet cell");
    target.scrollIntoView = jest.fn();
    Object.defineProperty(document, "elementFromPoint", {
      configurable: true,
      value: () => target,
    });
    // JSDOM has no native PointerEvent or layout hit testing. Supply the target cell explicitly.
    fireEvent(
      handle,
      new MouseEvent("pointerdown", { bubbles: true, button: 0 }),
    );
    fireEvent(
      handle,
      new MouseEvent("pointermove", {
        bubbles: true,
        clientX: 50,
        clientY: 50,
      }),
    );
    expect(onFill).not.toHaveBeenCalled();
    fireEvent(handle, new MouseEvent("pointerup", { bubbles: true }));
    expect(onFill.mock.calls).toEqual(
      categories.map((category) => [ids, category, "60"]),
    );
  },
);
it("discards a canceled fill gesture", () => {
  render(<GradeSpreadsheet rows={rows} disabled={false} onFill={onFill} />);
  act(() => score("Ada", "Programming").focus());
  const handle = screen.getByRole("button", {
    name: /Drag to copy Programming/,
  });
  handle.setPointerCapture = jest.fn();
  fireEvent(
    handle,
    new MouseEvent("pointerdown", { bubbles: true, button: 0 }),
  );
  fireEvent(handle, new MouseEvent("pointercancel", { bubbles: true }));
  fireEvent(handle, new MouseEvent("pointerup", { bubbles: true }));
  expect(onFill).not.toHaveBeenCalled();
});
it("disables editing and fill controls while saving", () => {
  render(<GradeSpreadsheet rows={rows} disabled onFill={onFill} />);
  expect(score("Ada", "Programming")).toBeDisabled();
  expect(screen.getByRole("button", { name: "Fill down" })).toBeDisabled();
  expect(
    screen.queryByRole("button", { name: /Drag to copy/ }),
  ).not.toBeInTheDocument();
});

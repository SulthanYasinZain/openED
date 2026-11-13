import { calculatedGradeAverage, saveGradesSchema } from "./grading";

it.each([
  ["0", "0", "0", "0"],
  ["100", "100", "100", "100"],
  ["80", "90", "100", "90"],
  ["0", "0", "100", "33.33"],
  ["100", "100", "0", "66.67"],
])(
  "calculates %s / %s / %s as %s",
  (programming, creativity, design, average) => {
    expect(calculatedGradeAverage({ programming, creativity, design })).toBe(
      average,
    );
  },
);
it.each(["", "-1", "101", "50.5", "abc"])(
  "does not calculate an incomplete or invalid score %s",
  (programming) => {
    expect(
      calculatedGradeAverage({ programming, creativity: "90", design: "100" }),
    ).toBe("");
  },
);
it("does not allow a client-supplied average to override category scores", () => {
  const parsed = saveGradesSchema.parse({
    classCode: "ABC123",
    meetingId: 7,
    grades: [
      {
        studentId: 3,
        programming: 80,
        creativity: 90,
        design: 100,
        finalAverage: 100,
      },
    ],
  });
  expect(parsed.grades[0]).not.toHaveProperty("finalAverage");
});

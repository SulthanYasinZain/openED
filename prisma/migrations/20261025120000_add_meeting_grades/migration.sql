CREATE TABLE "MeetingGrade" (
    "id" SERIAL NOT NULL,
    "meetingId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "programming" INTEGER,
    "creativity" INTEGER,
    "design" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MeetingGrade_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MeetingGrade_programming_check" CHECK ("programming" BETWEEN 0 AND 100),
    CONSTRAINT "MeetingGrade_creativity_check" CHECK ("creativity" BETWEEN 0 AND 100),
    CONSTRAINT "MeetingGrade_design_check" CHECK ("design" BETWEEN 0 AND 100)
);

CREATE UNIQUE INDEX "MeetingGrade_meetingId_studentId_key" ON "MeetingGrade"("meetingId", "studentId");
CREATE INDEX "MeetingGrade_studentId_idx" ON "MeetingGrade"("studentId");
ALTER TABLE "MeetingGrade" ADD CONSTRAINT "MeetingGrade_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "ClassMeeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MeetingGrade" ADD CONSTRAINT "MeetingGrade_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

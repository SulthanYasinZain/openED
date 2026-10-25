ALTER TABLE "MeetingGrade" ADD COLUMN "finalAverage" DECIMAL(5,2);
ALTER TABLE "MeetingGrade" ADD CONSTRAINT "MeetingGrade_finalAverage_check" CHECK ("finalAverage" BETWEEN 0 AND 100);

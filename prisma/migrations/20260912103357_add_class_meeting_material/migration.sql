-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "ClassMeeting" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT,
    "fileKey" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "MeetingStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassMeeting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassMeeting_classId_idx" ON "ClassMeeting"("classId");

-- AddForeignKey
ALTER TABLE "ClassMeeting" ADD CONSTRAINT "ClassMeeting_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

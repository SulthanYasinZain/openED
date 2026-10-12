-- CreateEnum
CREATE TYPE "ClassStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Class" ADD COLUMN "status" "ClassStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('SENT', 'FAILED', 'QUEUED');

-- AlterTable
ALTER TABLE "EmailLog" ADD COLUMN     "status" "EmailStatus" NOT NULL DEFAULT 'SENT';

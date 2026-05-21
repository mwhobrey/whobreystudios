-- CreateEnum
CREATE TYPE "EmailOutboxStatus" AS ENUM ('pending', 'sent', 'failed');

-- CreateTable
CREATE TABLE "EmailOutbox" (
    "id" TEXT NOT NULL,
    "toEmail" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "status" "EmailOutboxStatus" NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "idempotencyKey" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailOutbox_idempotencyKey_key" ON "EmailOutbox"("idempotencyKey");

-- CreateIndex
CREATE INDEX "EmailOutbox_status_createdAt_idx" ON "EmailOutbox"("status", "createdAt");

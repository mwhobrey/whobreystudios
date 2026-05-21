-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('deposit', 'final');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'cancelled');

-- AlterEnum
ALTER TYPE "ProjectStatus" ADD VALUE 'awaiting_deposit' AFTER 'approved';

-- AlterTable
ALTER TABLE "WorkspaceSettings" ADD COLUMN "defaultDepositPercent" INTEGER NOT NULL DEFAULT 40;

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN "depositPercent" INTEGER;

-- CreateTable
CREATE TABLE "PaymentRecord" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "quoteId" TEXT,
    "type" "PaymentType" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeEventId" TEXT,
    "metadataJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "PaymentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRecord_stripeSessionId_key" ON "PaymentRecord"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRecord_stripePaymentIntentId_key" ON "PaymentRecord"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRecord_stripeEventId_key" ON "PaymentRecord"("stripeEventId");

-- CreateIndex
CREATE INDEX "PaymentRecord_projectId_type_status_idx" ON "PaymentRecord"("projectId", "type", "status");

-- CreateIndex
CREATE INDEX "PaymentRecord_quoteId_idx" ON "PaymentRecord"("quoteId");

-- AddForeignKey
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

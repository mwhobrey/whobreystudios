-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "serviceTypeId" TEXT;

-- CreateTable
CREATE TABLE "ServiceType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceType_name_key" ON "ServiceType"("name");

-- CreateIndex
CREATE INDEX "ServiceType_isActive_sortOrder_idx" ON "ServiceType"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "Project_serviceTypeId_idx" ON "Project"("serviceTypeId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

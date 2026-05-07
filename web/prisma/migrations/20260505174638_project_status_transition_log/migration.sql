-- CreateTable
CREATE TABLE "ProjectStatusTransition" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "fromStatus" "ProjectStatus" NOT NULL,
    "toStatus" "ProjectStatus" NOT NULL,
    "actorUserId" TEXT,
    "reason" TEXT,
    "metadataJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectStatusTransition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectStatusTransition_projectId_createdAt_idx" ON "ProjectStatusTransition"("projectId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProjectStatusTransition" ADD CONSTRAINT "ProjectStatusTransition_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectStatusTransition" ADD CONSTRAINT "ProjectStatusTransition_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

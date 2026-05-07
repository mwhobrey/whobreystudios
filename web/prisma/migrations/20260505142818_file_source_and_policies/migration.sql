-- CreateEnum
CREATE TYPE "FileAssetSource" AS ENUM ('intake', 'revision', 'delivery');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'project_status_changed';

-- AlterTable
ALTER TABLE "FileAsset" ADD COLUMN     "source" "FileAssetSource" NOT NULL DEFAULT 'revision';

-- AlterTable
ALTER TABLE "WorkspaceSettings" ADD COLUMN     "finalFilesRequirePayment" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "privacyUrl" TEXT,
ADD COLUMN     "refundPolicyUrl" TEXT,
ADD COLUMN     "termsUrl" TEXT;

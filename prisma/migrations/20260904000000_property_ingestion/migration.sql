CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE "ImportStatus" AS ENUM ('QUEUED', 'FETCHING', 'RENDERING', 'EXTRACTING', 'READY', 'FAILED');

ALTER TABLE "Property" ALTER COLUMN "sourceUrl" DROP NOT NULL;
ALTER TABLE "Property" ADD COLUMN "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED';

CREATE TABLE "PropertyImport" (
  "id" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "canonicalUrl" TEXT NOT NULL,
  "status" "ImportStatus" NOT NULL DEFAULT 'QUEUED',
  "strategy" TEXT,
  "provider" TEXT,
  "retryCount" INTEGER NOT NULL DEFAULT 0,
  "draftData" JSONB,
  "evidence" JSONB,
  "errorMessage" TEXT,
  "inputTokens" INTEGER,
  "outputTokens" INTEGER,
  "firecrawlCredits" INTEGER NOT NULL DEFAULT 0,
  "processingStartedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "propertyId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PropertyImport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MutationAudit" (
  "id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT,
  "ipHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MutationAudit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Property_publicationStatus_idx" ON "Property"("publicationStatus");
CREATE INDEX "PropertyImport_status_createdAt_idx" ON "PropertyImport"("status", "createdAt");
CREATE INDEX "PropertyImport_canonicalUrl_idx" ON "PropertyImport"("canonicalUrl");
CREATE INDEX "PropertyImport_createdAt_idx" ON "PropertyImport"("createdAt");
CREATE INDEX "MutationAudit_ipHash_action_createdAt_idx" ON "MutationAudit"("ipHash", "action", "createdAt");
CREATE INDEX "MutationAudit_action_createdAt_idx" ON "MutationAudit"("action", "createdAt");

ALTER TABLE "PropertyImport" ADD CONSTRAINT "PropertyImport_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

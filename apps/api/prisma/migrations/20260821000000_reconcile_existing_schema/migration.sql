-- Reconcile databases created from the original Application-only schema with
-- the current schema. Every change preserves existing application records.

-- AlterTable
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "accessMode" TEXT NOT NULL DEFAULT 'owner';
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "timelineOrder" JSONB;
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "timelineSkippedStatuses" JSONB;

-- The original schema required each company/role pair to be unique. Demo and
-- owner records are now isolated by access mode, so replace that index with
-- the current three-column unique index.
DROP INDEX IF EXISTS "Application_company_role_key";
CREATE UNIQUE INDEX IF NOT EXISTS "Application_company_role_accessMode_key" ON "Application"("company", "role", "accessMode");
CREATE INDEX IF NOT EXISTS "Application_accessMode_idx" ON "Application"("accessMode");

-- CreateTable
CREATE TABLE IF NOT EXISTS "ApplicationTimelineEvent" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationTimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL,
    "accessMode" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ApplicationTimelineEvent_applicationId_occurredAt_idx" ON "ApplicationTimelineEvent"("applicationId", "occurredAt");
CREATE INDEX IF NOT EXISTS "Session_expiresAt_idx" ON "Session"("expiresAt");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ApplicationTimelineEvent_applicationId_fkey'
    ) THEN
        ALTER TABLE "ApplicationTimelineEvent"
            ADD CONSTRAINT "ApplicationTimelineEvent_applicationId_fkey"
            FOREIGN KEY ("applicationId") REFERENCES "Application"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

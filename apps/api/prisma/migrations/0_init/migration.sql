-- Clean schema baseline. This migration intentionally contains no application,
-- recruiter, interview, or other user data.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "source" TEXT,
    "salaryExpectation" TEXT,
    "appliedDate" TIMESTAMP(3),
    "recruiterContacted" BOOLEAN NOT NULL DEFAULT false,
    "recruiterName" TEXT,
    "followUpDate" TIMESTAMP(3),
    "excitement" TEXT,
    "excitedAbout" BOOLEAN NOT NULL DEFAULT false,
    "workStyle" TEXT,
    "whyCompany" TEXT,
    "cultureNotes" TEXT,
    "description" TEXT,
    "accessMode" TEXT NOT NULL DEFAULT 'owner',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "timelineOrder" JSONB,
    "timelineSkippedStatuses" JSONB,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationTimelineEvent" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationTimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "accessMode" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Application_accessMode_idx" ON "Application"("accessMode");

-- CreateIndex
CREATE UNIQUE INDEX "Application_company_role_accessMode_key" ON "Application"("company", "role", "accessMode");

-- CreateIndex
CREATE INDEX "ApplicationTimelineEvent_applicationId_occurredAt_idx" ON "ApplicationTimelineEvent"("applicationId", "occurredAt");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- AddForeignKey
ALTER TABLE "ApplicationTimelineEvent" ADD CONSTRAINT "ApplicationTimelineEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Application_company_role_key" ON "Application"("company", "role");

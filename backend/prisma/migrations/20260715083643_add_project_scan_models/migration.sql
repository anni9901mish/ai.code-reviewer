-- CreateTable
CREATE TABLE "ProjectScan" (
    "id" SERIAL NOT NULL,
    "folderName" TEXT NOT NULL,
    "totalFiles" INTEGER NOT NULL,
    "analyzedFiles" INTEGER NOT NULL,
    "failedFiles" INTEGER NOT NULL,
    "totalErrors" INTEGER NOT NULL,
    "totalWarnings" INTEGER NOT NULL,
    "overallScore" INTEGER,
    "languageSummary" JSONB NOT NULL,
    "aiReview" JSONB,
    "aiError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "ProjectScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectScanFile" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorCount" INTEGER NOT NULL,
    "warningCount" INTEGER NOT NULL,
    "staticAnalysis" JSONB NOT NULL,
    "analysisError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scanId" INTEGER NOT NULL,

    CONSTRAINT "ProjectScanFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectScan" ADD CONSTRAINT "ProjectScan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectScanFile" ADD CONSTRAINT "ProjectScanFile_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "ProjectScan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

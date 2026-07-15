const prisma = require("../config/prisma");

const saveProjectScan = async ({
  projectId,
  folderName,
  totalFiles,
  analyzedFiles,
  failedFiles,
  totalErrors,
  totalWarnings,
  languageSummary,
  projectAiReview,
  aiError,
  results,
}) => {
  return prisma.$transaction(async (tx) => {
    const scan = await tx.projectScan.create({
      data: {
        projectId,
        folderName,
        totalFiles,
        analyzedFiles,
        failedFiles,
        totalErrors,
        totalWarnings,
        overallScore: projectAiReview?.overallScore ?? null,
        languageSummary,
        aiReview: projectAiReview ?? null,
        aiError: aiError ?? null,
      },
    });

    if (results.length > 0) {
      await tx.projectScanFile.createMany({
        data: results.map((result) => ({
          scanId: scan.id,
          fileName: result.file,
          language: result.language,
          status: result.status,
          errorCount: result.staticAnalysis?.errorCount ?? 0,
          warningCount: result.staticAnalysis?.warningCount ?? 0,
          staticAnalysis: result.staticAnalysis,
          analysisError: result.error ?? null,
        })),
      });
    }

    return scan;
  });
};

const getUserProjectScans = async (userId) => {
  return prisma.projectScan.findMany({
    where: {
      project: {
        userId,
      },
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          language: true,
        },
      },
      _count: {
        select: {
          files: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getProjectScanById = async (userId, scanId) => {
  const scan = await prisma.projectScan.findFirst({
    where: {
      id: scanId,
      project: {
        userId,
      },
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          language: true,
        },
      },
      files: {
        orderBy: {
          id: "asc",
        },
      },
    },
  });

  if (!scan) {
    const error = new Error("Project scan not found");
    error.statusCode = 404;
    throw error;
  }

  return scan;
};

const deleteProjectScan = async (userId, scanId) => {
  const scan = await prisma.projectScan.findFirst({
    where: {
      id: scanId,
      project: {
        userId,
      },
    },
  });

  if (!scan) {
    const error = new Error("Project scan not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.projectScan.delete({
    where: {
      id: scanId,
    },
  });
};

module.exports = {
  saveProjectScan,
  getUserProjectScans,
  getProjectScanById,
  deleteProjectScan,
};
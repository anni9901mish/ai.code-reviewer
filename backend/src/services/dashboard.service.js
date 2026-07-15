const prisma = require("../config/prisma");

const getDashboardStats = async (userId) => {
  const [
    totalProjects,
    totalSingleFileReviews,
    totalProjectScans,
    singleFileAverage,
    projectScanAverage,
    projectScanTotals,
    projectLanguages,
    recentSingleFileReviews,
    recentProjectScans,
  ] = await Promise.all([
    prisma.project.count({
      where: {
        userId,
      },
    }),

    prisma.review.count({
      where: {
        project: {
          userId,
        },
      },
    }),

    prisma.projectScan.count({
      where: {
        project: {
          userId,
        },
      },
    }),

    prisma.review.aggregate({
      where: {
        project: {
          userId,
        },
        overallScore: {
          not: null,
        },
      },
      _avg: {
        overallScore: true,
      },
    }),

    prisma.projectScan.aggregate({
      where: {
        project: {
          userId,
        },
        overallScore: {
          not: null,
        },
      },
      _avg: {
        overallScore: true,
      },
    }),

    prisma.projectScan.aggregate({
      where: {
        project: {
          userId,
        },
      },
      _sum: {
        totalErrors: true,
        totalWarnings: true,
      },
    }),

    prisma.project.groupBy({
      by: ["language"],
      where: {
        userId,
      },
      _count: {
        language: true,
      },
    }),

    prisma.review.findMany({
      where: {
        project: {
          userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            language: true,
          },
        },
      },
    }),

    prisma.projectScan.findMany({
      where: {
        project: {
          userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            language: true,
          },
        },
      },
    }),
  ]);

  const singleFileScore =
    singleFileAverage._avg.overallScore || 0;

  const projectScanScore =
    projectScanAverage._avg.overallScore || 0;

  const scoredGroups = [];

  if (totalSingleFileReviews > 0) {
    scoredGroups.push({
      score: singleFileScore,
      count: totalSingleFileReviews,
    });
  }

  if (totalProjectScans > 0) {
    scoredGroups.push({
      score: projectScanScore,
      count: totalProjectScans,
    });
  }

  const totalScoredReviews = scoredGroups.reduce(
    (total, item) => total + item.count,
    0
  );

  const weightedScore = scoredGroups.reduce(
    (total, item) => total + item.score * item.count,
    0
  );

  const averageScore =
    totalScoredReviews > 0
      ? Number(
          (weightedScore / totalScoredReviews).toFixed(2)
        )
      : 0;

  const languageDistribution = projectLanguages.map(
    (item) => ({
      language: item.language,
      count: item._count.language,
    })
  );

  const mergedReviews = [
    ...recentSingleFileReviews.map((review) => ({
      id: review.id,
      type: "Single File",
      projectId: review.project.id,
      projectTitle: review.project.title,
      language: review.project.language,
      overallScore: review.overallScore,
      totalErrors: 0,
      totalWarnings: 0,
      createdAt: review.createdAt,
    })),

    ...recentProjectScans.map((scan) => ({
      id: scan.id,
      type: "Project Scan",
      projectId: scan.project.id,
      projectTitle: scan.project.title,
      language: scan.project.language,
      overallScore: scan.overallScore,
      totalErrors: scan.totalErrors || 0,
      totalWarnings: scan.totalWarnings || 0,
      createdAt: scan.createdAt,
    })),
  ];

  mergedReviews.sort(
    (a, b) =>
      new Date(b.createdAt) -
      new Date(a.createdAt)
  );

  const projectMap = new Map();

  for (const review of mergedReviews) {
    if (!projectMap.has(review.projectId)) {
      projectMap.set(review.projectId, review);
    }
  }

  const recentReviews = [...projectMap.values()].slice(
    0,
    5
  );

  return {
    totalProjects,
    totalReviews:
      totalSingleFileReviews + totalProjectScans,
    totalSingleFileReviews,
    totalProjectScans,
    averageScore,
    totalErrors:
      projectScanTotals._sum.totalErrors || 0,
    totalWarnings:
      projectScanTotals._sum.totalWarnings || 0,
    languageDistribution,
    recentReviews,
  };
};

module.exports = {
  getDashboardStats,
};
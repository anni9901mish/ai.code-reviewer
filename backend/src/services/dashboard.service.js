const prisma = require("../config/prisma");

const getDashboardStats = async (userId) => {
  const totalProjects = await prisma.project.count({
    where: {
      userId,
    },
  });

  const totalReviews = await prisma.review.count({
    where: {
      project: {
        userId,
      },
    },
  });

  const average = await prisma.review.aggregate({
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
  });

  const languages = await prisma.project.groupBy({
    by: ["language"],
    where: {
      userId,
    },
    _count: {
      language: true,
    },
  });

  const recentReviews = await prisma.review.findMany({
    where: {
      project: {
        userId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    include: {
      project: {
        select: {
          title: true,
          language: true,
        },
      },
    },
  });

  return {
    totalProjects,
    totalReviews,
    averageScore: average._avg.overallScore
      ? Number(average._avg.overallScore.toFixed(2))
      : 0,
    languageDistribution: languages,
    recentReviews,
  };
};

module.exports = {
  getDashboardStats,
};
const prisma = require("../config/prisma");

const saveStaticReview = async ({
  userId,
  projectId,
  fileName,
  language,
  staticAnalysis,
}) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
  });

  if (!project) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.review.create({
    data: {
      projectId,
      summary: `Static analysis completed for ${fileName} (${language})`,
      eslintReport: JSON.stringify(staticAnalysis),

      findings: {
        create: staticAnalysis.findings.map((finding) => ({
          severity: finding.severity,
          issue: finding.message,
          suggestedFix: finding.ruleId
            ? `Fix the ${finding.ruleId} rule violation`
            : "Review and correct this issue",
          line: finding.line || null,
        })),
      },
    },

    include: {
      findings: true,
    },
  });
};


const getUserReviews = async (userId) => {
  return prisma.review.findMany({
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
      findings: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getReviewById = async (userId, reviewId) => {
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      project: {
        userId,
      },
    },
    include: {
      project: true,
      findings: true,
    },
  });

  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  return review;
};

const updateReviewWithAI = async (reviewId, aiResult) => {
  return prisma.review.update({
    where: {
      id: reviewId,
    },
    data: {
      overallScore: aiResult.overallScore,
      summary: aiResult.summary,
      aiReview: JSON.stringify(aiResult),
    },
    include: {
      findings: true,
      project: true,
    },
  });
};

const deleteReview = async (userId, reviewId) => {
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      project: {
        userId,
      },
    },
  });

  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.review.delete({
    where: {
      id: reviewId,
    },
  });
};

module.exports = {
  saveStaticReview,
  getUserReviews,
  getReviewById,
  updateReviewWithAI,
  deleteReview,
};
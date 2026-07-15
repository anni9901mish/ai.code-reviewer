const {
  cloneRepository,
  deleteRepository,
} = require("../services/github/github.service");

const {
  analyzeProject,
} = require("../services/project/project-analysis.service");

const {
  saveProjectScan,
} = require("../services/project-scan.service");

const reviewGithubRepository = async (req, res) => {
  let repositoryPath = null;

  try {
    const projectId = Number(req.body.projectId);
    const repositoryUrl = req.body.repositoryUrl?.trim();

    if (!projectId) {
      return res.status(400).json({
        message: "Project ID is required",
      });
    }

    if (!repositoryUrl) {
      return res.status(400).json({
        message: "GitHub repository URL is required",
      });
    }

    const {
      repositoryName,
      repositoryPath: clonedPath,
    } = await cloneRepository(repositoryUrl);

    repositoryPath = clonedPath;

    const analysis = await analyzeProject(repositoryPath);

    if (analysis.files.length === 0) {
      return res.status(200).json({
        message:
          "Repository cloned, but no supported source files were found",
        repositoryName,
        repositoryUrl,
        totalFiles: 0,
        analyzedFiles: 0,
        failedFiles: 0,
        totalErrors: 0,
        totalWarnings: 0,
        languageSummary: {},
        projectAiReview: null,
        aiError: null,
        scan: null,
        results: [],
      });
    }

    const savedScan = await saveProjectScan({
      projectId,
      folderName: repositoryName,
      totalFiles: analysis.files.length,
      analyzedFiles: analysis.successfulResults.length,
      failedFiles: analysis.failedResults.length,
      totalErrors: analysis.totalErrors,
      totalWarnings: analysis.totalWarnings,
      languageSummary: analysis.languageSummary,
      projectAiReview: analysis.projectAiReview,
      aiError: analysis.aiError,
      results: analysis.results,
    });

    return res.status(200).json({
      message: analysis.projectAiReview
        ? "GitHub repository analyzed, AI reviewed and saved successfully"
        : "GitHub repository analyzed and saved. AI review is temporarily unavailable.",
      repositoryName,
      repositoryUrl,
      totalFiles: analysis.files.length,
      analyzedFiles: analysis.successfulResults.length,
      failedFiles: analysis.failedResults.length,
      totalErrors: analysis.totalErrors,
      totalWarnings: analysis.totalWarnings,
      languageSummary: analysis.languageSummary,
      projectAiReview: analysis.projectAiReview,
      aiError: analysis.aiError,
      scan: savedScan,
      results: analysis.results,
    });
  } catch (error) {
    console.log("GITHUB REVIEW ERROR:", error);

    return res.status(error.statusCode || 500).json({
      message:
        error.message || "GitHub repository analysis failed",
    });
  } finally {
    if (repositoryPath) {
      try {
        await deleteRepository(repositoryPath);
      } catch (cleanupError) {
        console.log(
          "GITHUB CLEANUP ERROR:",
          cleanupError.message
        );
      }
    }
  }
};

module.exports = {
  reviewGithubRepository,
};
const {
  scanProjectFiles,
} = require("../../utils/fileScanner");

const detectLanguage = require("../../utils/detectLanguage");

const {
  runStaticAnalysis,
} = require("../analyzers/analyzerFactory");

const {
  reviewProjectWithAI,
} = require("../project-ai.service");

const analyzeProject = async (projectPath) => {
  const files = await scanProjectFiles(projectPath);

  if (files.length === 0) {
    return {
      files: [],
      results: [],
      successfulResults: [],
      failedResults: [],
      totalErrors: 0,
      totalWarnings: 0,
      languageSummary: {},
      projectAiReview: null,
      aiError: null,
    };
  }

  const results = [];

  for (const file of files) {
    const language = detectLanguage(file.relativePath);

    try {
      const staticAnalysis =
        await runStaticAnalysis(
          language,
          file.absolutePath
        );

      results.push({
        file: file.relativePath,
        language,
        status: "success",
        staticAnalysis,
      });
    } catch (error) {
      results.push({
        file: file.relativePath,
        language,
        status: "failed",
        error: error.message,
        staticAnalysis: {
          errorCount: 0,
          warningCount: 0,
          findings: [],
        },
      });
    }
  }

  const successfulResults = results.filter(
    (r) => r.status === "success"
  );

  const failedResults = results.filter(
    (r) => r.status === "failed"
  );

  const totalErrors = successfulResults.reduce(
    (sum, r) =>
      sum + (r.staticAnalysis.errorCount || 0),
    0
  );

  const totalWarnings = successfulResults.reduce(
    (sum, r) =>
      sum + (r.staticAnalysis.warningCount || 0),
    0
  );

  const languageSummary = results.reduce(
    (obj, r) => {
      obj[r.language] =
        (obj[r.language] || 0) + 1;

      return obj;
    },
    {}
  );

  let projectAiReview = null;
  let aiError = null;

  try {
    projectAiReview =
      await reviewProjectWithAI({
        totalFiles: files.length,
        analyzedFiles:
          successfulResults.length,
        failedFiles: failedResults.length,
        totalErrors,
        totalWarnings,
        languageSummary,
        results,
      });
  } catch (error) {
    aiError = error.message;
  }

  return {
    files,
    results,
    successfulResults,
    failedResults,
    totalErrors,
    totalWarnings,
    languageSummary,
    projectAiReview,
    aiError,
  };
};

module.exports = {
  analyzeProject,
};
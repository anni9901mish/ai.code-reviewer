const fs = require("fs");
const path = require("path");

const {
  extractProject,
} = require("../services/zip.service");

const {
  scanProjectFiles,
} = require("../utils/fileScanner");

const detectLanguage = require("../utils/detectLanguage");

const {
  runStaticAnalysis,
} = require("../services/analyzers/analyzerFactory");

const {
  reviewProjectWithAI,
} = require("../services/project-ai.service");

const uploadProjectZip = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "ZIP file is required",
      });
    }

    const folderName = Date.now().toString();

    const extractPath = path.join(
      process.cwd(),
      "src",
      "uploads",
      "projects",
      folderName
    );

    await extractProject(req.file.path, extractPath);

    console.log(
      "Extracted root contents:",
      fs.readdirSync(extractPath)
    );

    const files = await scanProjectFiles(extractPath);

    if (files.length === 0) {
      return res.status(200).json({
        message:
          "Project extracted, but no supported source files were found",
        folder: folderName,
        totalFiles: 0,
        analyzedFiles: 0,
        failedFiles: 0,
        totalErrors: 0,
        totalWarnings: 0,
        languageSummary: {},
        projectAiReview: null,
        aiError: null,
        results: [],
      });
    }

    const results = [];

    for (const file of files) {
      const language = detectLanguage(file.relativePath);

      try {
        const staticAnalysis = await runStaticAnalysis(
          language,
          file.absolutePath
        );

        if (
          !staticAnalysis ||
          !Array.isArray(staticAnalysis.findings)
        ) {
          throw new Error(
            `${language} analyzer returned invalid output`
          );
        }

        results.push({
          file: file.relativePath,
          language,
          status: "success",
          staticAnalysis,
        });
      } catch (error) {
        console.log(
          `ANALYSIS FAILED: ${file.relativePath}`,
          error.message
        );

        results.push({
          file: file.relativePath,
          language,
          status: "failed",
          error:
            error.message || "Static analysis failed",
          staticAnalysis: {
            errorCount: 0,
            warningCount: 0,
            findings: [],
          },
        });
      }
    }

    const successfulResults = results.filter(
      (result) => result.status === "success"
    );

    const failedResults = results.filter(
      (result) => result.status === "failed"
    );

    const totalErrors = successfulResults.reduce(
      (total, result) =>
        total +
        (result.staticAnalysis.errorCount || 0),
      0
    );

    const totalWarnings = successfulResults.reduce(
      (total, result) =>
        total +
        (result.staticAnalysis.warningCount || 0),
      0
    );

    const languageSummary = results.reduce(
      (summary, result) => {
        summary[result.language] =
          (summary[result.language] || 0) + 1;

        return summary;
      },
      {}
    );

    let projectAiReview = null;
    let aiError = null;

    try {
      projectAiReview = await reviewProjectWithAI({
        totalFiles: files.length,
        analyzedFiles: successfulResults.length,
        failedFiles: failedResults.length,
        totalErrors,
        totalWarnings,
        languageSummary,
        results,
      });
    } catch (error) {
      aiError =
        error.message ||
        "Project AI review temporarily unavailable";

      console.log(
        "PROJECT AI REVIEW SKIPPED:",
        aiError
      );
    }

    return res.status(200).json({
      message: projectAiReview
        ? "Project extracted, analyzed and AI reviewed successfully"
        : "Project extracted and analyzed. AI project review is temporarily unavailable.",
      folder: folderName,
      totalFiles: files.length,
      analyzedFiles: successfulResults.length,
      failedFiles: failedResults.length,
      totalErrors,
      totalWarnings,
      languageSummary,
      projectAiReview,
      aiError,
      results,
    });
  } catch (error) {
    console.log("ZIP UPLOAD ERROR:", error);

    return res.status(
      error.statusCode || 500
    ).json({
      message:
        error.message ||
        "Project ZIP processing failed",
    });
  }
};

module.exports = {
  uploadProjectZip,
};
const fs = require("fs");

const detectLanguage = require("../utils/detectLanguage");

const {
  runStaticAnalysis,
} = require("../services/analyzers/analyzerFactory");

const {
  saveStaticReview,
  updateReviewWithAI,
} = require("../services/review.service");

const {
  reviewCodeWithAI,
} = require("../services/ai.service");

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a source code file",
      });
    }

    const projectId = Number(req.body.projectId);

    if (!projectId) {
      return res.status(400).json({
        message: "Project ID is required",
      });
    }

    const code = fs.readFileSync(req.file.path, "utf-8");
    const language = detectLanguage(req.file.originalname);

    const staticAnalysis = await runStaticAnalysis(
      language,
      req.file.path
    );

    if (
      !staticAnalysis ||
      !Array.isArray(staticAnalysis.findings)
    ) {
      throw new Error(
        `Static analyzer returned invalid output for ${language}`
      );
    }

    const review = await saveStaticReview({
      userId: req.user.id,
      projectId,
      fileName: req.file.originalname,
      language,
      staticAnalysis,
    });

    let aiResult = null;
    let updatedReview = review;
    let aiError = null;

    try {
      aiResult = await reviewCodeWithAI({
        code,
        language,
        staticAnalysis,
      });

      updatedReview = await updateReviewWithAI(
        review.id,
        aiResult
      );
    } catch (error) {
      aiError = error.message || "AI review temporarily unavailable";

      console.log("AI REVIEW SKIPPED:", aiError);
    }

    return res.status(201).json({
      message: aiResult
        ? "File analyzed and AI review saved successfully"
        : "Static analysis completed. AI review temporarily unavailable.",
      file: {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        language,
        size: req.file.size,
      },
      staticAnalysis,
      aiAnalysis: aiResult,
      aiError,
      review: updatedReview,
    });
  } catch (error) {
    console.log("UPLOAD ERROR:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "File analysis failed",
    });
  }
};

module.exports = {
  uploadFile,
};
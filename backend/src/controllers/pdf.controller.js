const {
  getProjectScanById,
} = require("../services/project-scan.service");

const {
  generateProjectScanPdf,
} = require("../services/pdf/pdf.service");

const downloadProjectScanPdf = async (req, res) => {
  try {
    const scanId = Number(req.params.scanId);

    if (!scanId) {
      return res.status(400).json({
        message: "Invalid scan ID",
      });
    }

    const scan = await getProjectScanById(
      req.user.id,
      scanId
    );

    return generateProjectScanPdf(scan, res);
  } catch (error) {
    console.log("PDF GENERATION ERROR:", error);

    if (res.headersSent) {
      return res.end();
    }

    return res.status(error.statusCode || 500).json({
      message:
        error.message || "Failed to generate PDF report",
    });
  }
};

module.exports = {
  downloadProjectScanPdf,
};
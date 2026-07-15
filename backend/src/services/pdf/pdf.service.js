const PDFDocument = require("pdfkit");

const safeText = (value, fallback = "Not available") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
};

const addSectionTitle = (doc, title) => {
  doc
    .moveDown(0.8)
    .fontSize(15)
    .font("Helvetica-Bold")
    .text(title)
    .moveDown(0.35);
};

const addParagraph = (doc, text) => {
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(safeText(text), {
      align: "justify",
      lineGap: 3,
    });
};

const addList = (doc, items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    addParagraph(doc, "No items reported.");
    return;
  }

  items.forEach((item) => {
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`• ${safeText(item)}`, {
        indent: 12,
        lineGap: 3,
      });
  });
};

const generateProjectScanPdf = (scan, response) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    bufferPages: true,
    info: {
      Title: `${scan.project.title} - Code Review Report`,
      Author: "AI Code Review Platform",
      Subject: "Project static analysis and AI review report",
    },
  });

  const projectTitle = safeText(scan.project?.title, "Project");
  const fileName = `${projectTitle
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .replace(/_+/g, "_")}-scan-${scan.id}-report.pdf`;

  response.setHeader("Content-Type", "application/pdf");
  response.setHeader(
    "Content-Disposition",
    `attachment; filename="${fileName}"`
  );

  doc.pipe(response);

  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .text("AI Code Review Report", {
      align: "center",
    });

  doc
    .moveDown(0.3)
    .font("Helvetica")
    .fontSize(11)
    .text(projectTitle, {
      align: "center",
    });

  doc.moveDown(1.4);

  doc.font("Helvetica-Bold").fontSize(11).text("Project Details");

  doc.moveDown(0.4);

  doc.font("Helvetica").fontSize(10);

  doc.text(`Project: ${projectTitle}`);
  doc.text(`Project ID: ${scan.projectId}`);
  doc.text(`Scan ID: ${scan.id}`);
  doc.text(`Folder / Repository: ${safeText(scan.folderName)}`);
  doc.text(`Created: ${new Date(scan.createdAt).toLocaleString()}`);
  doc.text(`Overall Score: ${scan.overallScore ?? "Not available"}/100`);

  doc.moveDown(0.8);

  doc
    .font("Helvetica-Bold")
    .text(
      `Files: ${scan.totalFiles}   Analyzed: ${scan.analyzedFiles}   Failed: ${scan.failedFiles}`
    );

  doc.text(
    `Errors: ${scan.totalErrors}   Warnings: ${scan.totalWarnings}`
  );

  addSectionTitle(doc, "Language Summary");

  const languageEntries = Object.entries(scan.languageSummary || {});

  if (languageEntries.length === 0) {
    addParagraph(doc, "No language data available.");
  } else {
    languageEntries.forEach(([language, count]) => {
      doc
        .font("Helvetica")
        .fontSize(10)
        .text(`• ${language}: ${count} file(s)`);
    });
  }

  const aiReview = scan.aiReview || {};

  addSectionTitle(doc, "Executive Summary");
  addParagraph(doc, aiReview.summary);

  addSectionTitle(doc, "Architecture");
  addParagraph(doc, aiReview.architecture);

  addSectionTitle(doc, "Security");
  addParagraph(doc, aiReview.security);

  addSectionTitle(doc, "Performance");
  addParagraph(doc, aiReview.performance);

  addSectionTitle(doc, "Maintainability");
  addParagraph(doc, aiReview.maintainability);

  addSectionTitle(doc, "Technical Debt");
  addParagraph(doc, aiReview.technicalDebt);

  addSectionTitle(doc, "Strengths");
  addList(doc, aiReview.strengths);

  addSectionTitle(doc, "Priority Issues");
  addList(doc, aiReview.priorityIssues);

  addSectionTitle(doc, "Recommendations");
  addList(doc, aiReview.recommendations);

  if (scan.aiError) {
    addSectionTitle(doc, "AI Review Status");
    addParagraph(doc, scan.aiError);
  }

  doc.addPage();

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Per-File Static Analysis", {
      align: "center",
    });

  doc.moveDown(1);

  if (!Array.isArray(scan.files) || scan.files.length === 0) {
    addParagraph(doc, "No file analysis records are available.");
  } else {
    scan.files.forEach((file, index) => {
      if (index > 0) {
        doc.moveDown(1);
      }

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(file.fileName);

      doc
        .font("Helvetica")
        .fontSize(9)
        .text(`Language: ${file.language}`)
        .text(`Status: ${file.status}`)
        .text(
          `Errors: ${file.errorCount} | Warnings: ${file.warningCount}`
        );

      if (file.analysisError) {
        doc
          .font("Helvetica")
          .fontSize(9)
          .text(`Analysis error: ${file.analysisError}`);
      }

      const findings = file.staticAnalysis?.findings || [];

      if (findings.length === 0) {
        doc
          .moveDown(0.3)
          .font("Helvetica")
          .fontSize(9)
          .text("No static-analysis findings.");
      } else {
        doc.moveDown(0.3);

        findings.forEach((finding) => {
          const location = finding.line
            ? `Line ${finding.line}${
                finding.column ? `, Column ${finding.column}` : ""
              }`
            : "Location unavailable";

          doc
            .font("Helvetica")
            .fontSize(9)
            .text(
              `• [${safeText(finding.severity).toUpperCase()}] ${safeText(
                finding.ruleId,
                "unknown-rule"
              )}`
            )
            .text(`  ${safeText(finding.message)}`, {
              indent: 10,
            })
            .text(`  ${location}`, {
              indent: 10,
            });
        });
      }
    });
  }

  const pageRange = doc.bufferedPageRange();

  for (
    let pageIndex = pageRange.start;
    pageIndex < pageRange.start + pageRange.count;
    pageIndex += 1
  ) {
    doc.switchToPage(pageIndex);

    doc
      .font("Helvetica")
      .fontSize(8)
      .text(
        `AI Code Review Platform | Page ${
          pageIndex - pageRange.start + 1
        } of ${pageRange.count}`,
        50,
        doc.page.height - 35,
        {
          align: "center",
          width: doc.page.width - 100,
        }
      );
  }

  doc.end();
};

module.exports = {
  generateProjectScanPdf,
};
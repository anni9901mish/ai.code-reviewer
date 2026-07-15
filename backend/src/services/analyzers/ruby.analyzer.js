const { exec } = require("child_process");
const path = require("path");

const RUBOCOP_PATH =
  "C:\\Ruby40-x64\\bin\\rubocop.bat";

const emptyAnalysis = () => ({
  analyzer: "RuboCop",
  errorCount: 0,
  warningCount: 0,
  findings: [],
});

const parseRubocopOutput = (output, filePath) => {
  if (!output.trim()) {
    return emptyAnalysis();
  }

  let report;

  try {
    report = JSON.parse(output);
  } catch {
    throw new Error("RuboCop returned invalid JSON");
  }

  const findings = [];

  for (const file of report.files || []) {
    for (const offense of file.offenses || []) {
      const severity =
        offense.severity === "error" ||
        offense.severity === "fatal"
          ? "error"
          : "warning";

      findings.push({
        ruleId: offense.cop_name || "rubocop",
        severity,
        message: offense.message,
        line: Number(offense.location?.start_line) || null,
        column: Number(offense.location?.start_column) || null,
        endLine: Number(offense.location?.last_line) || null,
        endColumn: Number(offense.location?.last_column) || null,
      });
    }
  }

  return {
    analyzer: "RuboCop",
    file: path.basename(filePath),
    errorCount: findings.filter(
      (finding) => finding.severity === "error"
    ).length,
    warningCount: findings.filter(
      (finding) => finding.severity === "warning"
    ).length,
    findings,
  };
};

const escapeCommandValue = (value) =>
  String(value).replace(/"/g, '\\"');

const runRubyAnalyzer = async (filePath) => {
  return new Promise((resolve, reject) => {
    const safeFilePath = escapeCommandValue(filePath);

    const command =
      `"${RUBOCOP_PATH}" ` +
      `"${safeFilePath}" ` +
      `--format json --force-exclusion`;

    exec(
      command,
      {
        windowsHide: true,
        maxBuffer: 5 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        if (stdout?.trim()) {
          try {
            return resolve(
              parseRubocopOutput(stdout, filePath)
            );
          } catch (parseError) {
            return reject(parseError);
          }
        }

        if (error && stderr?.trim()) {
          return reject(new Error(stderr.trim()));
        }

        if (error) {
          return reject(
            new Error(
              error.message || "Ruby analysis failed"
            )
          );
        }

        return resolve(emptyAnalysis());
      }
    );
  });
};

module.exports = {
  runRubyAnalyzer,
};
const { exec } = require("child_process");

const PHPCS_PATH =
  "C:\\Users\\anime\\AppData\\Roaming\\Composer\\vendor\\bin\\phpcs.bat";

const emptyAnalysis = () => ({
  errorCount: 0,
  warningCount: 0,
  findings: [],
});

const parsePhpcsOutput = (output) => {
  if (!output.trim()) {
    return emptyAnalysis();
  }

  let report;

  try {
    report = JSON.parse(output);
  } catch {
    throw new Error("PHPCS returned invalid JSON");
  }

  const findings = [];

  for (const fileResult of Object.values(report.files || {})) {
    for (const message of fileResult.messages || []) {
      findings.push({
        ruleId: message.source || "phpcs",
        severity:
          message.type === "ERROR" ? "error" : "warning",
        message: message.message,
        line: Number(message.line) || null,
        column: Number(message.column) || null,
        endLine: null,
        endColumn: null,
      });
    }
  }

  return {
    errorCount: findings.filter(
      (finding) => finding.severity === "error"
    ).length,
    warningCount: findings.filter(
      (finding) => finding.severity === "warning"
    ).length,
    findings,
  };
};

const runPhpAnalyzer = async (filePath) => {
  return new Promise((resolve, reject) => {
    const command = `"${PHPCS_PATH}" --report=json --standard=PSR12 "${filePath}"`;

    exec(
      command,
      {
        windowsHide: true,
        maxBuffer: 5 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        if (stdout?.trim()) {
          try {
            return resolve(parsePhpcsOutput(stdout));
          } catch (parseError) {
            return reject(parseError);
          }
        }

        if (error && stderr?.trim()) {
          return reject(new Error(stderr.trim()));
        }

        if (error) {
          return reject(
            new Error(error.message || "PHPCS analysis failed")
          );
        }

        return resolve(emptyAnalysis());
      }
    );
  });
};

module.exports = {
  runPhpAnalyzer,
};
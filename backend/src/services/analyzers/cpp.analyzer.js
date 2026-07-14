const { execFile } = require("child_process");

const parseCppcheckOutput = (output) => {
  const findings = output
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const match = line.match(
        /^(.+?):(\d+):(\d+):\s+\((error|warning|style|performance|portability|information)\)\s+(.+)$/
      );

      if (!match) {
        return null;
      }

      const [, , row, column, type, message] = match;

      return {
        ruleId: `cppcheck-${type}`,
        severity: type === "error" ? "error" : "warning",
        message,
        line: Number(row),
        column: Number(column),
        endLine: null,
        endColumn: null,
      };
    })
    .filter(Boolean);

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

const runCppAnalyzer = async (filePath) => {
  return new Promise((resolve, reject) => {
    execFile(
      "C:\\Program Files\\Cppcheck\\cppcheck.exe",
      [
        "--enable=warning,style,performance,portability",
        "--template={file}:{line}:{column}: ({severity}) {message}",
        filePath,
      ],
      {
        windowsHide: true,
        maxBuffer: 5 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        const output = `${stdout || ""}\n${stderr || ""}`.trim();

        if (output) {
          return resolve(parseCppcheckOutput(output));
        }

        if (error) {
          return reject(
            new Error(
              stderr?.trim() ||
                error.message ||
                "Cppcheck analysis failed"
            )
          );
        }

        return resolve({
          errorCount: 0,
          warningCount: 0,
          findings: [],
        });
      }
    );
  });
};

module.exports = {
  runCppAnalyzer,
};
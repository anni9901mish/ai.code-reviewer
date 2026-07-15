const { execFile } = require("child_process");
const path = require("path");

const CHECKSTYLE_JAR = path.join(
  process.cwd(),
  "tools",
  "checkstyle",
  "checkstyle-all.jar"
);

const emptyAnalysis = () => ({
  errorCount: 0,
  warningCount: 0,
  findings: [],
});

const parseCheckstyleOutput = (output) => {
  const findings = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(
        /^\[(ERROR|WARN|WARNING)\]\s+(.+?):(\d+)(?::(\d+))?:\s+(.+?)(?:\s+\[([^\]]+)\])?$/
      );

      if (!match) {
        return null;
      }

      const [, level, , row, column, message, ruleId] = match;

      return {
        ruleId: ruleId || "checkstyle",
        severity: level === "ERROR" ? "error" : "warning",
        message,
        line: Number(row),
        column: column ? Number(column) : null,
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

const runJavaAnalyzer = async (filePath) => {
  return new Promise((resolve, reject) => {
    execFile(
      "java",
      [
        "-jar",
        CHECKSTYLE_JAR,
        "-c",
        "/google_checks.xml",
        filePath,
      ],
      {
        windowsHide: true,
        maxBuffer: 5 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        const output = `${stdout || ""}\n${stderr || ""}`.trim();

        if (output) {
          return resolve(parseCheckstyleOutput(output));
        }

        if (error?.code === "ENOENT") {
          return reject(
            new Error("Java is not installed or not available in PATH")
          );
        }

        if (error) {
          return reject(
            new Error(
              stderr?.trim() ||
                error.message ||
                "Checkstyle analysis failed"
            )
          );
        }

        return resolve(emptyAnalysis());
      }
    );
  });
};

module.exports = {
  runJavaAnalyzer,
};
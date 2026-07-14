const { execFile } = require("child_process");

const parseFlake8Output = (output) => {
  if (!output.trim()) {
    return {
      errorCount: 0,
      warningCount: 0,
      findings: [],
    };
  }

  const findings = output
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const match = line.match(
        /^(.*?):(\d+):(\d+):\s+([A-Z]\d+)\s+(.*)$/
      );

      if (!match) {
        return null;
      }

      const [, , row, column, ruleId, message] = match;

      const isError =
        ruleId.startsWith("E9") ||
        ruleId.startsWith("F");

      return {
        ruleId,
        severity: isError ? "error" : "warning",
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

const runPythonAnalyzer = async (filePath) => {
  return new Promise((resolve, reject) => {
    const format =
      "%(path)s:%(row)d:%(col)d: %(code)s %(text)s";

    execFile(
      "python",
      [
        "-m",
        "flake8",
        filePath,
        `--format=${format}`,
      ],
      {
        windowsHide: true,
        maxBuffer: 1024 * 1024,
      },
      (error, stdout, stderr) => {
        if (stdout) {
          return resolve(parseFlake8Output(stdout));
        }

        if (error && error.code === 1) {
          return resolve({
            errorCount: 0,
            warningCount: 0,
            findings: [],
          });
        }

        if (error) {
          console.error("FLAKE8 ERROR:", stderr || error.message);

          return reject(
            new Error(
              stderr?.trim() ||
                error.message ||
                "Python analysis failed"
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
  runPythonAnalyzer,
};
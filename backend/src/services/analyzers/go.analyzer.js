const { execFile } = require("child_process");
const path = require("path");

const parseGoVetOutput = (output) => {
  const findings = output
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.+?):(\d+):(\d+):\s+(.+)$/);

      if (!match) {
        return null;
      }

      const [, , row, column, message] = match;

      return {
        ruleId: "go-vet",
        severity: "warning",
        message,
        line: Number(row),
        column: Number(column),
        endLine: null,
        endColumn: null,
      };
    })
    .filter(Boolean);

  return {
    errorCount: 0,
    warningCount: findings.length,
    findings,
  };
};

const runGoAnalyzer = async (filePath) => {
  return new Promise((resolve, reject) => {
    const workingDirectory = path.dirname(filePath);
    const fileName = path.basename(filePath);

    execFile(
      "go",
      ["vet", fileName],
      {
        cwd: workingDirectory,
        windowsHide: true,
        maxBuffer: 5 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        const output = `${stdout || ""}\n${stderr || ""}`.trim();

        if (output) {
          return resolve(parseGoVetOutput(output));
        }

        if (error && error.code === "ENOENT") {
          return reject(
            new Error("Go is not installed or is not available in PATH")
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
  runGoAnalyzer,
};
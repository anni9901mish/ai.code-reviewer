const { execFile } = require("child_process");
const path = require("path");

const emptyAnalysis = () => ({
  errorCount: 0,
  warningCount: 0,
  findings: [],
});

const parseGoVetOutput = (output) => {
  if (!output.trim()) {
    return emptyAnalysis();
  }

  const findings = output
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.+?):(\d+):(\d+):\s+(.+)$/);

      if (!match) return null;

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

const runGoAnalyzer = (filePath) =>
  new Promise((resolve, reject) => {
    const cwd = path.dirname(filePath);
    const file = path.basename(filePath);

    execFile(
      "go",
      ["vet", file],
      {
        cwd,
        windowsHide: true,
      },
      (error, stdout, stderr) => {
        const output = `${stdout}\n${stderr}`.trim();

        if (output) {
          return resolve(parseGoVetOutput(output));
        }

        if (error?.code === "ENOENT") {
          return reject(new Error("Go is not installed"));
        }

        resolve(emptyAnalysis());
      }
    );
  });

module.exports = {
  runGoAnalyzer,
};
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const CARGO_PATH =
  "C:\\Users\\anime\\.cargo\\bin\\cargo.exe";

const emptyAnalysis = () => ({
  errorCount: 0,
  warningCount: 0,
  findings: [],
});

const parseClippyOutput = (output) => {
  const findings = output
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const match = line.match(
        /^(.+?):(\d+):(\d+):\s+(warning|error):\s+(.+)$/
      );

      if (!match) {
        return null;
      }

      const [, , row, column, severity, message] = match;

      return {
        ruleId: "clippy",
        severity,
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

const runRustAnalyzer = async (filePath) => {
  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "rust-analysis-")
  );

  const srcDir = path.join(tempDir, "src");
  const cargoFile = path.join(tempDir, "Cargo.toml");
  const rustFile = path.join(srcDir, "main.rs");

  fs.mkdirSync(srcDir);
  fs.copyFileSync(filePath, rustFile);

  fs.writeFileSync(
    cargoFile,
    `[package]
name = "analysis"
version = "0.1.0"
edition = "2024"
`
  );

  return new Promise((resolve, reject) => {
    execFile(
      CARGO_PATH,
      ["clippy", "--message-format=short"],
      {
        cwd: tempDir,
        windowsHide: true,
        maxBuffer: 5 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        const output = `${stdout || ""}\n${stderr || ""}`.trim();

        try {
          if (output) {
            return resolve(parseClippyOutput(output));
          }

          if (error?.code === "ENOENT") {
            return reject(
              new Error(
                "Cargo/Clippy executable was not found"
              )
            );
          }

          if (error) {
            return reject(
              new Error(
                stderr?.trim() ||
                  error.message ||
                  "Rust analysis failed"
              )
            );
          }

          return resolve(emptyAnalysis());
        } finally {
          fs.rmSync(tempDir, {
            recursive: true,
            force: true,
          });
        }
      }
    );
  });
};

module.exports = {
  runRustAnalyzer,
};
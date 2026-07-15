const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const DOTNET_PATH = "C:\\Program Files\\dotnet\\dotnet.exe";

const emptyAnalysis = () => ({
  errorCount: 0,
  warningCount: 0,
  findings: [],
});

const parseDotnetOutput = (output) => {
  const findings = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(
        /^(.+?)\((\d+),(\d+)\):\s+(error|warning)\s+([A-Z]+\d+):\s+(.+?)(?:\s+\[.+\])?$/
      );

      if (!match) {
        return null;
      }

      const [, , row, column, level, ruleId, message] = match;

      return {
        ruleId,
        severity: level === "error" ? "error" : "warning",
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

const runCSharpAnalyzer = async (filePath) => {
  const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "csharp-analysis-")
  );

  const sourceFile = path.join(temporaryDirectory, "Program.cs");
  const projectFile = path.join(
    temporaryDirectory,
    "AnalyzerProject.csproj"
  );

  fs.copyFileSync(filePath, sourceFile);

  fs.writeFileSync(
    projectFile,
    `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <AnalysisLevel>latest</AnalysisLevel>
    <EnableNETAnalyzers>true</EnableNETAnalyzers>
  </PropertyGroup>
</Project>`
  );

  return new Promise((resolve, reject) => {
    execFile(
      DOTNET_PATH,
      [
        "build",
        projectFile,
        "--nologo",
        "--no-incremental",
      ],
      {
        cwd: temporaryDirectory,
        windowsHide: true,
        maxBuffer: 5 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        const output = `${stdout || ""}\n${stderr || ""}`.trim();

        try {
          if (output) {
            return resolve(parseDotnetOutput(output));
          }

          if (error?.code === "ENOENT") {
            return reject(
              new Error(
                ".NET SDK is not installed or not available"
              )
            );
          }

          if (error) {
            return reject(
              new Error(
                stderr?.trim() ||
                  error.message ||
                  "C# analysis failed"
              )
            );
          }

          return resolve(emptyAnalysis());
        } finally {
          fs.rmSync(temporaryDirectory, {
            recursive: true,
            force: true,
          });
        }
      }
    );
  });
};

module.exports = {
  runCSharpAnalyzer,
};
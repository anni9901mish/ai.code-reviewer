const fg = require("fast-glob");
const fs = require("fs");
const path = require("path");

const SUPPORTED_EXTENSIONS = [
  "js",
  "jsx",
  "mjs",
  "cjs",
  "ts",
  "tsx",
  "py",
  "java",
  "c",
  "h",
  "cpp",
  "cc",
  "cxx",
  "hpp",
  "cs",
  "go",
  "php",
  "rb",
  "rs",
  "kt",
  "kts",
  "swift",
  "dart",
];

const scanProjectFiles = async (projectPath) => {
  if (!fs.existsSync(projectPath)) {
    throw new Error("Extracted project directory does not exist");
  }

  const patterns = SUPPORTED_EXTENSIONS.map(
    (extension) => `**/*.${extension}`
  );

  const files = await fg(patterns, {
    cwd: projectPath,
    absolute: true,
    onlyFiles: true,
    unique: true,
    followSymbolicLinks: false,
    dot: false,
    ignore: [
      "**/node_modules/**",
      "**/.git/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/coverage/**",
      "**/vendor/**",
      "**/target/**",
      "**/bin/**",
      "**/obj/**",
      "**/__pycache__/**",
    ],
  });

  return files.map((file) => ({
    absolutePath: file,
    relativePath: path
      .relative(projectPath, file)
      .replace(/\\/g, "/"),
  }));
};

module.exports = {
  scanProjectFiles,
};
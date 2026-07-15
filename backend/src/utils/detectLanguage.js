const path = require("path");

const languageMap = {
  ".js": "JavaScript",
  ".jsx": "JavaScript React",
  ".mjs": "JavaScript",
  ".cjs": "JavaScript",

  ".ts": "TypeScript",
  ".tsx": "TypeScript React",

  ".py": "Python",

  ".java": "Java",

  ".c": "C",
  ".h": "C",
  ".cpp": "C++",
  ".cc": "C++",
  ".cxx": "C++",
  ".hpp": "C++",

  ".cs": "C#",
  ".go": "Go",
  ".php": "PHP",
  ".rb": "Ruby",
  ".rs": "Rust",
  ".kt": "Kotlin",
  ".kts": "Kotlin",
  ".swift": "Swift",
  ".dart": "Dart",

  ".html": "HTML",
  ".htm": "HTML",
  ".css": "CSS",
  ".scss": "SCSS",
  ".sass": "Sass",

  ".sql": "SQL",
  ".json": "JSON",
  ".yaml": "YAML",
  ".yml": "YAML",
  ".md": "Markdown",
  ".sh": "Shell",
  ".ps1": "PowerShell",
  
};

const detectLanguage = (fileName) => {
  const extension = path.extname(fileName).toLowerCase();
  return languageMap[extension] || "Unknown";
};

module.exports = detectLanguage;
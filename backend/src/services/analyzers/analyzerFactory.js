const {
  runJavaScriptAnalyzer,
} = require("./javascript.analyzer");

const {
  runPythonAnalyzer,
} = require("./python.analyzer");

const {
  runTypeScriptAnalyzer,
} = require("./typescript.analyzer");

const {
  runCppAnalyzer,
} = require("./cpp.analyzer");

const {
  runGoAnalyzer,
} = require("./go.analyzer");

const emptyAnalysis = (language, note = "") => ({
  analyzer: "AI-only",
  language,
  errorCount: 0,
  warningCount: 0,
  findings: [],
  note,
});

const runStaticAnalysis = async (language, filePath) => {
  let result;

  switch (language) {
    case "JavaScript":
    case "JavaScript React":
      result = await runJavaScriptAnalyzer(filePath);
      break;

    case "TypeScript":
    case "TypeScript React":
      result = await runTypeScriptAnalyzer(filePath);
      break;

    case "Python":
      result = await runPythonAnalyzer(filePath);
      break;

    case "C":
    case "C++":
      result = await runCppAnalyzer(filePath);
      break;

    case "Go":
      result = await runGoAnalyzer(filePath);
      break;

    default:
      result = emptyAnalysis(
        language,
        `${language} static analyzer is not configured yet. AI review will still run.`
      );
  }

  if (!result || !Array.isArray(result.findings)) {
    return emptyAnalysis(
      language,
      `${language} analyzer returned an invalid result. AI review will still run.`
    );
  }

  return result;
};

module.exports = {
  runStaticAnalysis,
};
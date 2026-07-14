const { analyzeJavaScript } = require("../eslint.service");

const runJavaScriptAnalyzer = async (filePath) => {
  return analyzeJavaScript(filePath);
};

module.exports = {
  runJavaScriptAnalyzer,
};
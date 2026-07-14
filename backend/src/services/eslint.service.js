const { ESLint } = require("eslint");

const analyzeJavaScript = async (filePath) => {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [
      {
        files: ["**/*.js", "**/*.jsx"],
        languageOptions: {
  ecmaVersion: "latest",
  sourceType: "module",
  globals: {
    console: "readonly",
  },
},
        rules: {
          "no-unused-vars": "warn",
          "no-undef": "error",
          "no-unreachable": "error",
          "no-constant-condition": "warn",
          "no-extra-semi": "warn",
          "no-debugger": "warn",
          "eqeqeq": "warn",
          "prefer-const": "warn",
        },
      },
    ],
  });

  const results = await eslint.lintFiles([filePath]);

  const findings = results.flatMap((result) =>
    result.messages.map((message) => ({
      ruleId: message.ruleId || "syntax-error",
      severity: message.severity === 2 ? "error" : "warning",
      message: message.message,
      line: message.line,
      column: message.column,
      endLine: message.endLine || null,
      endColumn: message.endColumn || null,
    }))
  );

  return {
    errorCount: results.reduce(
      (total, result) => total + result.errorCount,
      0
    ),
    warningCount: results.reduce(
      (total, result) => total + result.warningCount,
      0
    ),
    findings,
  };
};

module.exports = {
  analyzeJavaScript,
};
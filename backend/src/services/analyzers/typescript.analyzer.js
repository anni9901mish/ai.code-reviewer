const { ESLint } = require("eslint");
const tseslint = require("typescript-eslint");

const runTypeScriptAnalyzer = async (filePath) => {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [
      ...tseslint.configs.recommended,
      {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
          parser: tseslint.parser,
          parserOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
          },
          globals: {
            console: "readonly",
          },
        },
        rules: {
          "@typescript-eslint/no-unused-vars": "warn",
          "@typescript-eslint/no-explicit-any": "warn",
          "no-debugger": "warn",
          "prefer-const": "warn",
          "eqeqeq": "warn",
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
  runTypeScriptAnalyzer,
};
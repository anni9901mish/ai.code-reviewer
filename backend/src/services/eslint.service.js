const { ESLint } = require("eslint");

const analyzeJavaScript = async (filePath) => {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [
      {
        files: ["**/*.{js,jsx,mjs,cjs}"],

        languageOptions: {
          ecmaVersion: "latest",
          sourceType: "module",

          parserOptions: {
            ecmaFeatures: {
              jsx: true,
            },
          },

          globals: {
            console: "readonly",
            window: "readonly",
            document: "readonly",
            navigator: "readonly",
            localStorage: "readonly",
            sessionStorage: "readonly",
            fetch: "readonly",
            alert: "readonly",
            prompt: "readonly",
            confirm: "readonly",
            setTimeout: "readonly",
            clearTimeout: "readonly",
            setInterval: "readonly",
            clearInterval: "readonly",
            process: "readonly",
            module: "readonly",
            require: "readonly",
            __dirname: "readonly",
            exports: "readonly",
          },
        },

        rules: {
          "no-unused-vars": "warn",
          "no-undef": "error",
          "no-unreachable": "error",
          "no-constant-condition": "warn",
          "no-extra-semi": "warn",
          "no-debugger": "warn",
          eqeqeq: "warn",
          "prefer-const": "warn",
        },
      },
    ],
  });

  const results = await eslint.lintFiles([filePath]);

  const findings = results.flatMap((result) =>
    result.messages.map((message) => ({
      ruleId: message.ruleId || "syntax-error",
      severity:
        message.severity === 2
          ? "error"
          : "warning",
      message: message.message,
      line: message.line,
      column: message.column,
      endLine: message.endLine || null,
      endColumn: message.endColumn || null,
    }))
  );

  return {
    errorCount: results.reduce(
      (sum, result) => sum + result.errorCount,
      0
    ),
    warningCount: results.reduce(
      (sum, result) => sum + result.warningCount,
      0
    ),
    findings,
  };
};

module.exports = {
  analyzeJavaScript,
};
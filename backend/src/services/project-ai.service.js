const { GoogleGenAI } = require("@google/genai");

const MODELS = [
  "gemini-flash-latest",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
];

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const extractFirstJsonObject = (text) => {
  const cleanedText = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const startIndex = cleanedText.indexOf("{");

  if (startIndex === -1) {
    throw new Error("Gemini response does not contain JSON");
  }

  let depth = 0;
  let insideString = false;
  let escaped = false;

  for (
    let index = startIndex;
    index < cleanedText.length;
    index += 1
  ) {
    const character = cleanedText[index];

    if (insideString) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        insideString = false;
      }

      continue;
    }

    if (character === '"') {
      insideString = true;
      continue;
    }

    if (character === "{") {
      depth += 1;
    }

    if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return JSON.parse(
          cleanedText.slice(startIndex, index + 1)
        );
      }
    }
  }

  throw new Error("Gemini returned incomplete JSON");
};

const isRetryableError = (error) => {
  const message = error?.message || "";

  return (
    message.includes('"code":503') ||
    message.includes('"code":429') ||
    message.includes("UNAVAILABLE") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("high demand") ||
    message.includes("fetch failed") ||
    message.includes("ECONNRESET")
  );
};

const generateProjectReview = async ({
  ai,
  model,
  prompt,
}) => {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: {
        type: "object",
        additionalProperties: false,
        required: [
          "overallScore",
          "summary",
          "architecture",
          "security",
          "performance",
          "maintainability",
          "technicalDebt",
          "strengths",
          "priorityIssues",
          "recommendations",
        ],
        properties: {
          overallScore: {
            type: "integer",
            minimum: 0,
            maximum: 100,
          },
          summary: {
            type: "string",
          },
          architecture: {
            type: "string",
          },
          security: {
            type: "string",
          },
          performance: {
            type: "string",
          },
          maintainability: {
            type: "string",
          },
          technicalDebt: {
            type: "string",
          },
          strengths: {
            type: "array",
            items: {
              type: "string",
            },
          },
          priorityIssues: {
            type: "array",
            items: {
              type: "string",
            },
          },
          recommendations: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
      },
      temperature: 0.1,
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response");
  }

  return extractFirstJsonObject(response.text);
};

const reviewProjectWithAI = async ({
  totalFiles,
  analyzedFiles,
  failedFiles,
  totalErrors,
  totalWarnings,
  languageSummary,
  results,
}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const compactResults = results.map((result) => ({
    file: result.file,
    language: result.language,
    status: result.status,
    errorCount:
      result.staticAnalysis?.errorCount || 0,
    warningCount:
      result.staticAnalysis?.warningCount || 0,
    findings:
      result.staticAnalysis?.findings
        ?.slice(0, 10)
        .map((finding) => ({
          ruleId: finding.ruleId,
          severity: finding.severity,
          message: finding.message,
          line: finding.line,
        })) || [],
    error: result.error || null,
  }));

  const prompt = `
You are a senior software architect reviewing an entire software project.

Project statistics:
${JSON.stringify(
  {
    totalFiles,
    analyzedFiles,
    failedFiles,
    totalErrors,
    totalWarnings,
    languageSummary,
  },
  null,
  2
)}

Per-file static analysis:
${JSON.stringify(compactResults, null, 2)}

Return exactly one JSON object with this structure:

{
  "overallScore": 0,
  "summary": "",
  "architecture": "",
  "security": "",
  "performance": "",
  "maintainability": "",
  "technicalDebt": "",
  "strengths": [],
  "priorityIssues": [],
  "recommendations": []
}

Rules:
- overallScore must be between 0 and 100.
- Evaluate the project as a whole.
- Prioritize recurring and high-severity issues.
- Clearly mention when information is insufficient.
- Do not invent files, vulnerabilities, dependencies, or architecture.
- Return only one valid JSON object.
- Do not add markdown or extra text.
`;

  let lastError;

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        console.log(
          `Calling project AI model ${model}, attempt ${attempt}...`
        );

        const result = await generateProjectReview({
          ai,
          model,
          prompt,
        });

        console.log(
          `Project AI response received from ${model}`
        );

        return result;
      } catch (error) {
        lastError = error;

        console.error(
          `PROJECT AI ERROR (${model}, attempt ${attempt}):`,
          error?.message || error
        );

        if (!isRetryableError(error)) {
          throw error;
        }

        if (attempt < 2) {
          await wait(1500 * attempt);
        }
      }
    }
  }

  throw new Error(
    lastError?.message ||
      "All Gemini models are temporarily unavailable"
  );
};

module.exports = {
  reviewProjectWithAI,
};
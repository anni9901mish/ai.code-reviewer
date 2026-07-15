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
        const jsonText = cleanedText.slice(
          startIndex,
          index + 1
        );

        return JSON.parse(jsonText);
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

const generateWithModel = async ({
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
          "strengths",
          "bugs",
          "securityIssues",
          "performanceSuggestions",
          "codeSmells",
          "refactoringSuggestions",
          "bestPractices",
          "documentationSuggestions",
          "refactoredCode",
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
          strengths: {
            type: "array",
            items: {
              type: "string",
            },
          },
          bugs: {
            type: "array",
            items: {
              type: "string",
            },
          },
          securityIssues: {
            type: "array",
            items: {
              type: "string",
            },
          },
          performanceSuggestions: {
            type: "array",
            items: {
              type: "string",
            },
          },
          codeSmells: {
            type: "array",
            items: {
              type: "string",
            },
          },
          refactoringSuggestions: {
            type: "array",
            items: {
              type: "string",
            },
          },
          bestPractices: {
            type: "array",
            items: {
              type: "string",
            },
          },
          documentationSuggestions: {
            type: "array",
            items: {
              type: "string",
            },
          },
          refactoredCode: {
            type: "string",
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

const reviewCodeWithAI = async ({
  code,
  language,
  staticAnalysis,
}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const prompt = `
You are a senior software engineer performing a professional code review.

Programming language:
${language}

Source code:
${code}

Static analysis:
${JSON.stringify(staticAnalysis, null, 2)}

Return exactly one JSON object with this structure:

{
  "overallScore": 0,
  "summary": "",
  "strengths": [],
  "bugs": [],
  "securityIssues": [],
  "performanceSuggestions": [],
  "codeSmells": [],
  "refactoringSuggestions": [],
  "bestPractices": [],
  "documentationSuggestions": [],
  "refactoredCode": ""
}

Rules:
- overallScore must be an integer between 0 and 100.
- Return exactly one JSON object.
- Do not add markdown.
- Do not add text before or after JSON.
- Do not invent unsupported issues.
`;

  let lastError;

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        console.log(
          `Calling Gemini model ${model}, attempt ${attempt}...`
        );

        const result = await generateWithModel({
          ai,
          model,
          prompt,
        });

        console.log(`Gemini response received from ${model}`);

        return result;
      } catch (error) {
        lastError = error;

        console.error(
          `GEMINI ERROR (${model}, attempt ${attempt}):`,
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
  reviewCodeWithAI,
};
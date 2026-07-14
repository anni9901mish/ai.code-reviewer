require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

async function testGemini() {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    console.log("Calling Gemini...");

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: 'Return only valid JSON: {"working": true}',
      config: {
        responseMimeType: "application/json",
      },
    });

    console.log("Gemini response:");
    console.log(response.text);
  } catch (error) {
    console.error("GEMINI TEST ERROR:");
    console.error(error.message || error);
  }
}

testGemini();
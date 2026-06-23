const { GoogleGenerativeAI } = require("@google/generative-ai");

function parseJsonResponse(rawText) {
  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (_error) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("The LLM did not return valid JSON.");
    }

    return JSON.parse(match[0]);
  }
}

function validateEvaluationJson(value) {
  const requiredFields = ["marks", "grade", "feedback", "missing_points", "suggestions"];
  for (const field of requiredFields) {
    if (!(field in value)) {
      throw new Error(`The LLM response is missing required field: ${field}`);
    }
  }

  if (!Array.isArray(value.missing_points)) {
    value.missing_points = [String(value.missing_points || "")].filter(Boolean);
  }

  if (!Array.isArray(value.suggestions)) {
    value.suggestions = [String(value.suggestions || "")].filter(Boolean);
  }

  return value;
}

async function evaluateWithGroq(prompt) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Return only strict JSON. Do not include markdown, explanations, or extra text."
        },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq request failed: ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function evaluateWithGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json"
    }
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function evaluateAnswer(prompt) {
  const provider = (process.env.LLM_PROVIDER || "groq").toLowerCase();
  const rawText =
    provider === "gemini" ? await evaluateWithGemini(prompt) : await evaluateWithGroq(prompt);

  return validateEvaluationJson(parseJsonResponse(rawText));
}

module.exports = { evaluateAnswer };

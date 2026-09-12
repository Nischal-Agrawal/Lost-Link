import { env } from "../config/env.js";
import { buildComparisonPayload } from "./aiSanitizer.js";

const AI_TIMEOUT_MS = 8000;

function isConfigured() {
  return Boolean(
    env.AI_PROVIDER &&
      env.AI_API_KEY &&
      env.AI_MODEL
  );
}

function extractJson(text) {
  const trimmed = text.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const fencedMatch = trimmed.match(
    /```(?:json)?\s*([\s\S]*?)\s*```/i
  );

  if (fencedMatch) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return null;
}

function validateAiResult(result) {
  if (!result || typeof result !== "object") {
    return null;
  }

  const similarityScore = Number(result.similarityScore);

  if (
    !Number.isFinite(similarityScore) ||
    similarityScore < 0 ||
    similarityScore > 1
  ) {
    return null;
  }

  return {
    similarityScore,
    reason:
      typeof result.reason === "string"
        ? result.reason.trim().slice(0, 500)
        : ""
  };
}

function parseAiResult(content) {
  if (typeof content !== "string") {
    return null;
  }

  const json = extractJson(content);

  if (!json) {
    return null;
  }

  try {
    return validateAiResult(JSON.parse(json));
  } catch {
    return null;
  }
}

async function requestJson(url, body, headers = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    AI_TIMEOUT_MS
  );

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers
      },
      signal: controller.signal,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function callOpenAI(source, candidate) {
  const payload = buildComparisonPayload(source, candidate);
  const data = await requestJson(
    "https://api.openai.com/v1/chat/completions",
    {
      model: env.AI_MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Compare two lost-and-found item reports. Extract important details from the source story. Return JSON only with similarityScore between 0 and 1 and a short reason."
        },
        {
          role: "user",
          content: JSON.stringify(payload)
        }
      ]
    },
    { Authorization: `Bearer ${env.AI_API_KEY}` }
  );

  const content = data?.choices?.[0]?.message?.content;

  return parseAiResult(content);
}

async function callGemini(source, candidate) {
  const payload = buildComparisonPayload(source, candidate);
  const data = await requestJson(
    `https://generativelanguage.googleapis.com/v1beta/models/${env.AI_MODEL}:generateContent?key=${encodeURIComponent(env.AI_API_KEY)}`,
    {
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json"
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: [
                "You are a lost-and-found matching assistant.",
                "Extract important details from the source story, compare them with the candidate report, and decide whether they plausibly describe the same physical item.",
                "Return JSON only: {\"similarityScore\": number from 0 to 1, \"reason\": \"short explanation mentioning the strongest matching details\"}.",
                JSON.stringify(payload)
              ].join("\n\n")
            }
          ]
        }
      ]
    }
  );

  const content = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("");

  return parseAiResult(content);
}

export async function getAiMatch(source, candidate) {
  if (!isConfigured()) {
    return null;
  }

  if (env.AI_PROVIDER.toLowerCase() === "gemini") {
    return callGemini(source, candidate);
  }

  if (env.AI_PROVIDER.toLowerCase() === "openai") {
    return callOpenAI(source, candidate);
  }

  return null;
}

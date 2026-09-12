import { env } from "../config/env.js";

const AI_TIMEOUT_MS = 8000;
const MAX_CLAIMS = 10;
const MAX_TEXT_LENGTH = 500;

function clean(value) {
  return String(value || "")
    .trim()
    .slice(0, MAX_TEXT_LENGTH);
}

function parseJson(text) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");

  if (start === -1 || end <= start) {
    return null;
  }

  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function validateRanking(value, claimIds) {
  if (!Array.isArray(value)) {
    return null;
  }

  const validIds = new Set(claimIds);
  const seen = new Set();

  const ranking = value
    .map((entry) => ({
      claimId: entry?.claimId,
      rank: Number(entry?.rank),
      confidence: clean(entry?.confidence).toUpperCase(),
      reason: clean(entry?.reason)
    }))
    .filter((entry) => {
      if (
        !validIds.has(entry.claimId) ||
        seen.has(entry.claimId) ||
        !Number.isInteger(entry.rank) ||
        entry.rank < 1 ||
        !entry.reason
      ) {
        return false;
      }

      seen.add(entry.claimId);
      return true;
    })
    .sort((a, b) => a.rank - b.rank);

  return ranking.length ? ranking : null;
}

export async function rankClaimsWithAi(item, claims) {
  if (!env.AI_API_KEY || env.AI_PROVIDER?.toLowerCase() !== "gemini") {
    const error = new Error("AI_NOT_CONFIGURED");
    throw error;
  }

  const limitedClaims = claims.slice(0, MAX_CLAIMS);
  const claimIds = limitedClaims.map((claim) => claim.id);
  const prompt = {
    item: {
      title: clean(item.title),
      type: item.type,
      category: clean(item.category),
      color: clean(item.color),
      brand: clean(item.brand),
      location: clean(item.location),
      date: item.date,
      description: clean(item.description)
    },
    claims: limitedClaims.map((claim) => ({
      claimId: claim.id,
      claimant: clean(claim.claimant.name),
      statement: clean(claim.message)
    }))
  };

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    AI_TIMEOUT_MS
  );

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${env.AI_MODEL}:generateContent?key=${encodeURIComponent(env.AI_API_KEY)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({
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
                    "Rank these claim statements for a lost-and-found administrator.",
                    "Use only evidence in the report and claim statements. Do not make a final legal or ownership decision.",
                    "Return a JSON array only, ordered best first, with one object per claim: {claimId, rank, confidence, reason}.",
                    JSON.stringify(prompt)
                  ].join("\n\n")
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error("AI_REQUEST_FAILED");
    }

    const data = await response.json();
    const content = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("");
    const ranking = validateRanking(
      parseJson(content || ""),
      claimIds
    );

    if (!ranking) {
      throw new Error("AI_INVALID_RESPONSE");
    }

    return {
      ranking,
      limited: claims.length > MAX_CLAIMS
    };
  } finally {
    clearTimeout(timeout);
  }
}

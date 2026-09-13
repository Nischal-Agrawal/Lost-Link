import { env } from "../config/env.js";

const AI_TIMEOUT_MS = 8000;
const MAX_CLAIMS = 10;
const MAX_TEXT_LENGTH = 500;

function clean(value) {
  return String(value || "")
    .trim()
    .slice(0, MAX_TEXT_LENGTH);
}

function tokenize(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function localRanking(item, claims) {
  const itemTokens = new Set(
    tokenize(
      [
        item.title,
        item.description,
        item.category,
        item.color,
        item.brand,
        item.location
      ].join(" ")
    )
  );

  return claims
    .slice(0, MAX_CLAIMS)
    .map((claim) => {
      const claimTokens = tokenize(claim.message);
      const overlap = claimTokens.filter((token) =>
        itemTokens.has(token)
      ).length;
      const score = claimTokens.length
        ? overlap / claimTokens.length
        : 0;

      return {
        claimId: claim.id,
        score,
        confidence: score >= 0.35 ? "MEDIUM" : "REVIEW",
        reason:
          overlap > 0
            ? `The statement shares ${overlap} descriptive detail${overlap === 1 ? "" : "s"} with the report.`
            : "The statement does not share clear descriptive terms with the report."
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({
      claimId: entry.claimId,
      rank: index + 1,
      confidence: entry.confidence,
      reason: entry.reason
    }));
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
    return {
      ranking: localRanking(item, claims),
      limited: claims.length > MAX_CLAIMS,
      source: "local-fallback"
    };
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
      claimant: clean(claim.claimant?.name),
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
      limited: claims.length > MAX_CLAIMS,
      source: "gemini"
    };
  } catch (error) {
    return {
      ranking: localRanking(item, claims),
      limited: claims.length > MAX_CLAIMS,
      source: "local-fallback",
      warning:
        error.message === "AI_REQUEST_FAILED"
          ? "Gemini was unavailable, so local evidence ranking was used."
          : "Gemini returned an unusable response, so local evidence ranking was used."
    };
  } finally {
    clearTimeout(timeout);
  }
}

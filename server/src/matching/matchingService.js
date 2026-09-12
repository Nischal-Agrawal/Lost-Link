import { prisma } from "../config/prisma.js";

import {
  findCandidates
} from "./candidateSelector.js";

import {
  calculateRuleScore
} from "./ruleMatcher.js";

import {
  calculateTextSimilarities
} from "./textMatcher.js";

import {
  calculateLocalScore,
  combineAiEvidence,
  getConfidence,
  shouldReject
} from "./scoreEngine.js";

import {
  getAiMatch
} from "./aiMatcher.js";

const MAX_AI_CANDIDATES = 5;
const MAX_RESULTS = 10;

function buildMatchResult(
  candidate,
  ruleResult,
  textScore,
  localScore,
  finalScore,
  aiResult
) {
  return {
    item: {
      id: candidate.id,
      type: candidate.type,
      title: candidate.title,
      description:
        candidate.description,
      category:
        candidate.category,
      color: candidate.color,
      brand:
        candidate.brand,
      location:
        candidate.location,
      date:
        candidate.date,
      imageUrl:
        candidate.imageUrl,
      status:
        candidate.status,
      user: candidate.user
    },

    score: finalScore,

    matchPercentage:
      Math.round(
        finalScore * 100
      ),

    confidence:
      getConfidence(finalScore),

    localScore,

    structuredScore:
      ruleResult.score,

    textSimilarity:
      textScore,

    aiScore:
      aiResult?.similarityScore ??
      null,

    aiReason:
      aiResult?.reason ??
      null
  };
}

export async function findMatches(
  itemId
) {
  const sourceItem =
    await prisma.item.findUnique({
      where: {
        id: itemId
      }
    });

  if (!sourceItem) {
    const error =
      new Error("Item not found");

    error.statusCode = 404;
    error.code = "NOT_FOUND";

    throw error;
  }

  const candidates =
    await findCandidates(
      sourceItem
    );

  if (!candidates.length) {
    return {
      sourceItem,
      matches: []
    };
  }

  const textResults =
    calculateTextSimilarities(
      sourceItem,
      candidates
    );

  const textByItemId =
    new Map(
      textResults.map(
        (result) => [
          result.itemId,
          result.score
        ]
      )
    );

  const scoredCandidates = [];

  for (const candidate of candidates) {
    const ruleResult =
      calculateRuleScore(
        sourceItem,
        candidate
      );

    const textScore =
      textByItemId.get(
        candidate.id
      ) || 0;

    const localScore =
      calculateLocalScore(
        ruleResult.score,
        textScore
      );

    if (
      shouldReject(localScore)
    ) {
      continue;
    }

    scoredCandidates.push({
      candidate,
      ruleResult,
      textScore,
      localScore
    });
  }

  scoredCandidates.sort(
    (a, b) =>
      b.localScore -
      a.localScore
  );

  /*
   * The deterministic matcher narrows the search first.
   * Gemini then enriches the highest-ranked candidates,
   * including strong matches, with story-level evidence.
   */
  const aiCandidates =
    scoredCandidates
      .slice(
        0,
        MAX_AI_CANDIDATES
      );

  const aiResults =
    new Map();

  for (const entry of aiCandidates) {
    const aiResult =
      await getAiMatch(
        sourceItem,
        entry.candidate
      );

    if (aiResult) {
      aiResults.set(
        entry.candidate.id,
        aiResult
      );
    }
  }

  const results =
    scoredCandidates.map(
      (entry) => {
        const aiResult =
          aiResults.get(
            entry.candidate.id
          );

        const finalScore =
          aiResult
            ? combineAiEvidence(
                entry.localScore,
                aiResult.similarityScore
              )
            : entry.localScore;

        return buildMatchResult(
          entry.candidate,
          entry.ruleResult,
          entry.textScore,
          entry.localScore,
          finalScore,
          aiResult
        );
      }
    );

  results.sort(
    (a, b) =>
      b.score -
      a.score
  );

  return {
    sourceItem,
    matches:
      results.slice(
        0,
        MAX_RESULTS
      )
  };
}
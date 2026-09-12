export const STRUCTURED_WEIGHT = 0.70;
export const TEXT_WEIGHT = 0.30;

export const AI_AMBIGUOUS_MIN = 0.50;
export const AI_AMBIGUOUS_MAX = 0.849;

export const REJECT_THRESHOLD = 0.50;
export const HIGH_CONFIDENCE_THRESHOLD = 0.85;

export function calculateLocalScore(
  structuredScore,
  textScore
) {
  return (
    structuredScore *
      STRUCTURED_WEIGHT +
    textScore *
      TEXT_WEIGHT
  );
}

export function getConfidence(score) {
  if (
    score >=
    HIGH_CONFIDENCE_THRESHOLD
  ) {
    return "HIGH";
  }

  if (score >= 0.65) {
    return "MEDIUM";
  }

  return "LOW";
}

export function isAmbiguous(
  localScore
) {
  return (
    localScore >=
      AI_AMBIGUOUS_MIN &&
    localScore <=
      AI_AMBIGUOUS_MAX
  );
}

export function shouldReject(
  localScore
) {
  return (
    localScore <
    REJECT_THRESHOLD
  );
}

export function combineAiEvidence(
  localScore,
  aiScore
) {
  /*
   * AI is additional evidence, not a replacement
   * for the deterministic local matcher.
   */
  const finalScore =
    localScore * 0.80 +
    aiScore * 0.20;

  return Math.min(
    1,
    Math.max(0, finalScore)
  );
}
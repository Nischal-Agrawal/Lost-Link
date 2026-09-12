const STRUCTURED_WEIGHTS = {
  category: 0.20,
  location: 0.25,
  date: 0.15,
  color: 0.10,
  brand: 0.10
};

function normalize(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function tokenizeLocation(location) {
  return normalize(location)
    .split(/[\s,./_-]+/)
    .filter(Boolean);
}

function locationSimilarity(source, candidate) {
  const a = tokenizeLocation(source);
  const b = tokenizeLocation(candidate);

  if (!a.length || !b.length) {
    return 0;
  }

  if (
    normalize(source) ===
    normalize(candidate)
  ) {
    return 1;
  }

  const setA = new Set(a);
  const setB = new Set(b);

  const intersection = [...setA].filter(
    (token) => setB.has(token)
  );

  const union = new Set([
    ...setA,
    ...setB
  ]);

  return intersection.length / union.size;
}

function dateSimilarity(sourceDate, candidateDate) {
  const first = new Date(sourceDate);
  const second = new Date(candidateDate);

  if (
    Number.isNaN(first.getTime()) ||
    Number.isNaN(second.getTime())
  ) {
    return 0;
  }

  const differenceMs = Math.abs(
    first.getTime() -
      second.getTime()
  );

  const differenceDays =
    differenceMs /
    (1000 * 60 * 60 * 24);

  if (differenceDays === 0) {
    return 1;
  }

  if (differenceDays <= 1) {
    return 0.9;
  }

  if (differenceDays <= 3) {
    return 0.7;
  }

  if (differenceDays <= 7) {
    return 0.4;
  }

  if (differenceDays <= 14) {
    return 0.2;
  }

  return 0;
}

function exactOrPartialSimilarity(
  source,
  candidate
) {
  const a = normalize(source);
  const b = normalize(candidate);

  if (!a || !b) {
    return 0;
  }

  if (a === b) {
    return 1;
  }

  if (
    a.includes(b) ||
    b.includes(a)
  ) {
    return 0.75;
  }

  const tokensA = new Set(
    a.split(/\s+/)
  );

  const tokensB = new Set(
    b.split(/\s+/)
  );

  const intersection = [...tokensA].filter(
    (token) => tokensB.has(token)
  );

  if (!intersection.length) {
    return 0;
  }

  const union = new Set([
    ...tokensA,
    ...tokensB
  ]);

  return intersection.length / union.size;
}

export function calculateRuleScore(
  source,
  candidate
) {
  const categoryScore =
    exactOrPartialSimilarity(
      source.category,
      candidate.category
    );

  const locationScore =
    locationSimilarity(
      source.location,
      candidate.location
    );

  const dateScore =
    dateSimilarity(
      source.date,
      candidate.date
    );

  const colorScore =
    exactOrPartialSimilarity(
      source.color,
      candidate.color
    );

  /*
   * Missing brands are neutral rather than an
   * automatic mismatch.
   */
  const brandScore =
    !source.brand ||
    !candidate.brand
      ? 0.5
      : exactOrPartialSimilarity(
          source.brand,
          candidate.brand
        );

  const score =
    categoryScore *
      STRUCTURED_WEIGHTS.category +
    locationScore *
      STRUCTURED_WEIGHTS.location +
    dateScore *
      STRUCTURED_WEIGHTS.date +
    colorScore *
      STRUCTURED_WEIGHTS.color +
    brandScore *
      STRUCTURED_WEIGHTS.brand;

  return {
    score,
    breakdown: {
      category: categoryScore,
      location: locationScore,
      date: dateScore,
      color: colorScore,
      brand: brandScore
    }
  };
}
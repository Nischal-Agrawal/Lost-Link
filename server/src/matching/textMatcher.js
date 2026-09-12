function normalizeText(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  return normalizeText(text)
    .split(" ")
    .filter(
      (token) =>
        token.length > 1
    );
}

function buildItemText(item) {
  return [
    item.title,
    item.description,
    item.category,
    item.color,
    item.brand || ""
  ].join(" ");
}

function termFrequency(tokens) {
  const counts = new Map();

  for (const token of tokens) {
    counts.set(
      token,
      (counts.get(token) || 0) + 1
    );
  }

  const total = tokens.length;

  const frequencies = new Map();

  for (const [
    token,
    count
  ] of counts.entries()) {
    frequencies.set(
      token,
      count / total
    );
  }

  return frequencies;
}

function inverseDocumentFrequency(
  documents
) {
  const documentCount =
    documents.length;

  const documentFrequency =
    new Map();

  for (const tokens of documents) {
    const uniqueTokens =
      new Set(tokens);

    for (const token of uniqueTokens) {
      documentFrequency.set(
        token,
        (documentFrequency.get(
          token
        ) || 0) + 1
      );
    }
  }

  const idf = new Map();

  for (const [
    token,
    frequency
  ] of documentFrequency.entries()) {
    idf.set(
      token,
      Math.log(
        (documentCount + 1) /
          (frequency + 1)
      ) + 1
    );
  }

  return idf;
}

function buildVector(
  tokens,
  idf,
  vocabulary
) {
  const tf = termFrequency(tokens);

  return vocabulary.map(
    (token) =>
      (tf.get(token) || 0) *
      (idf.get(token) || 0)
  );
}

function cosineSimilarity(
  vectorA,
  vectorB
) {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (
    let index = 0;
    index < vectorA.length;
    index += 1
  ) {
    dotProduct +=
      vectorA[index] *
      vectorB[index];

    magnitudeA +=
      vectorA[index] ** 2;

    magnitudeB +=
      vectorB[index] ** 2;
  }

  if (
    magnitudeA === 0 ||
    magnitudeB === 0
  ) {
    return 0;
  }

  return (
    dotProduct /
    (Math.sqrt(magnitudeA) *
      Math.sqrt(magnitudeB))
  );
}

export function calculateTextSimilarities(
  source,
  candidates
) {
  const sourceTokens =
    tokenize(buildItemText(source));

  const candidateTokens =
    candidates.map((candidate) =>
      tokenize(
        buildItemText(candidate)
      )
    );

  const documents = [
    sourceTokens,
    ...candidateTokens
  ];

  const idf =
    inverseDocumentFrequency(
      documents
    );

  const vocabulary = [
    ...new Set(
      documents.flat()
    )
  ];

  const sourceVector =
    buildVector(
      sourceTokens,
      idf,
      vocabulary
    );

  return candidates.map(
    (candidate, index) => {
      const candidateVector =
        buildVector(
          candidateTokens[index],
          idf,
          vocabulary
        );

      return {
        itemId: candidate.id,
        score: cosineSimilarity(
          sourceVector,
          candidateVector
        )
      };
    }
  );
}

export function calculateTextSimilarity(
  source,
  candidate
) {
  const results =
    calculateTextSimilarities(
      source,
      [candidate]
    );

  return results[0]?.score || 0;
}
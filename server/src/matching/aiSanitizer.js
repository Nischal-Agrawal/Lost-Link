const MAX_DESCRIPTION_LENGTH = 1000;

function cleanString(
  value,
  maxLength = 200
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .slice(0, maxLength);
}

export function sanitizeForAI(
  item
) {
  return {
    category: cleanString(
      item.category,
      100
    ),

    color: cleanString(
      item.color,
      50
    ),

    brand: cleanString(
      item.brand,
      100
    ),

    approximateLocation:
      cleanString(
        item.location,
        200
      ),

    date:
      item.date instanceof Date
        ? item.date
            .toISOString()
            .slice(0, 10)
        : cleanString(
            item.date,
            20
          ),

    description:
      cleanString(
        item.description,
        MAX_DESCRIPTION_LENGTH
      )
  };
}

export function buildComparisonPayload(
  source,
  candidate
) {
  return {
    source: sanitizeForAI(source),
    candidate: sanitizeForAI(
      candidate
    )
  };
}
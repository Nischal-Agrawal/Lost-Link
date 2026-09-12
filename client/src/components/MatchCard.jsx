import {
  Link
} from "react-router-dom";

function formatDate(value) {
  return new Intl.DateTimeFormat(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric"
    }
  ).format(new Date(value));
}

function getConfidenceClass(
  confidence
) {
  return `confidence-${confidence.toLowerCase()}`;
}

export default function MatchCard({
  match
}) {
  const item =
    match.item;

  return (
    <article className="match-card">
      <div className="match-score">
        <strong>
          {match.matchPercentage}%
        </strong>

        <span>
          match
        </span>
      </div>

      <div className="match-content">
        <div className="match-top">
          <span
            className={`badge badge-${item.type.toLowerCase()}`}
          >
            {item.type}
          </span>

          <span
            className={`confidence-badge ${getConfidenceClass(
              match.confidence
            )}`}
          >
            {match.confidence} CONFIDENCE
          </span>
        </div>

        <h3>
          {item.title}
        </h3>

        <p>
          {item.description}
        </p>

        <div className="match-details">
          <span>
            <strong>Category:</strong>{" "}
            {item.category}
          </span>

          <span>
            <strong>Color:</strong>{" "}
            {item.color}
          </span>

          <span>
            <strong>Brand:</strong>{" "}
            {item.brand ||
              "Not specified"}
          </span>

          <span>
            <strong>Location:</strong>{" "}
            {item.location}
          </span>

          <span>
            <strong>Date:</strong>{" "}
            {formatDate(item.date)}
          </span>
        </div>

        {match.aiReason && (
          <div className="ai-reason">
            <strong>
              Additional semantic evidence
            </strong>

            <p>
              {match.aiReason}
            </p>
          </div>
        )}

        <Link
          className="button button-secondary"
          to={`/items/${item.id}`}
        >
          View Item
        </Link>
      </div>
    </article>
  );
}
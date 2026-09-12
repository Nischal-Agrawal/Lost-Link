import { useState } from "react";
import { Link } from "react-router-dom";

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

export default function ItemCard({
  item
}) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="item-card">
      {item.imageUrl && !imageFailed ? (
        <img
          className="item-image"
          src={item.imageUrl}
          alt={item.title}
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className="item-image item-image-placeholder"
          aria-hidden="true"
        >
          {item.type === "LOST"
            ? "LOST"
            : "FOUND"}
        </div>
      )}

      <div className="item-card-body">
        <div className="item-card-top">
          <span
            className={`badge badge-${item.type.toLowerCase()}`}
          >
            {item.type}
          </span>

          <span
            className={`badge badge-${item.status.toLowerCase()}`}
          >
            {item.status}
          </span>
        </div>

        <h3>{item.title}</h3>

        <p className="item-description">
          {item.description}
        </p>

        <div className="item-meta">
          <span>
            <strong>Category:</strong>{" "}
            {item.category}
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

        <Link
          className="button button-secondary item-card-button"
          to={`/items/${item.id}`}
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
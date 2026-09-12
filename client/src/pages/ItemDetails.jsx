import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { itemService } from "../services/itemService.js";
import { matchingService } from "../services/matchingService.js";
import { claimService } from "../services/claimService.js";
import { useAuth } from "../hooks/useAuth.js";

import MatchCard from "../components/MatchCard.jsx";
import ClaimForm from "../components/ClaimForm.jsx";
import ClaimCard from "../components/ClaimCard.jsx";

export default function ItemDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [claims, setClaims] = useState([]);

  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const [error, setError] = useState("");

  const isOwner = user && item && user.id === item.userId;

  async function loadItem() {
    try {
      setLoading(true);
      setError("");

      const response = await itemService.getById(id);
      setItem(response.data.item);
      setImageFailed(false);
    } catch (err) {
      setError(err.message || "Failed to load item.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMatches() {
    try {
      setMatchesLoading(true);

      const response = await matchingService.getMatches(id);
      setMatches(response.data?.matches || []);
    } catch {
      setMatches([]);
    } finally {
      setMatchesLoading(false);
    }
  }

  async function loadClaims() {
    if (!isOwner) {
      return;
    }

    try {
      setClaimsLoading(true);

      const response = await claimService.getForItem(id);
      setClaims(response.claims || []);
    } catch {
      setClaims([]);
    } finally {
      setClaimsLoading(false);
    }
  }

  useEffect(() => {
    loadItem();
  }, [id]);

  useEffect(() => {
    if (item) {
      loadMatches();
    }
  }, [item]);

  useEffect(() => {
    if (item && isOwner) {
      loadClaims();
    }
  }, [item, isOwner]);

  if (loading) {
    return <div className="page-container">Loading item...</div>;
  }

  if (error && !item) {
    return (
      <div className="page-container">
        <div className="alert error">{error}</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="page-container">
        <div className="empty-state card">
          <h2>Item not found</h2>
          <Link to="/items" className="btn btn-primary">
            Back to Items
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {error && <div className="alert error">{error}</div>}

      <div className="item-detail-grid">
        <div className="item-detail-main card">
          {item.imageUrl && !imageFailed ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="item-detail-image"
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="item-detail-image item-image-placeholder">
              IMAGE UNAVAILABLE
            </div>
          )}

          <div className="item-detail-content">
            <div className="item-detail-top">
              <span
                className={`item-type-badge ${item.type.toLowerCase()}`}
              >
                {item.type}
              </span>

              <span className="status-badge">
                {item.status}
              </span>
            </div>

            <h1>{item.title}</h1>

            <p className="item-description">
              {item.description}
            </p>

            <div className="item-meta-grid">
              <div>
                <span>Category</span>
                <strong>{item.category}</strong>
              </div>

              <div>
                <span>Color</span>
                <strong>{item.color}</strong>
              </div>

              <div>
                <span>Brand</span>
                <strong>{item.brand || "Not specified"}</strong>
              </div>

              <div>
                <span>Location</span>
                <strong>{item.location}</strong>
              </div>

              <div>
                <span>Date</span>
                <strong>
                  {new Date(item.date).toLocaleDateString()}
                </strong>
              </div>
            </div>

          </div>
        </div>

        <aside className="item-sidebar">
          {item.status === "ACTIVE" && (
              <ClaimForm
                itemId={item.id}
                onCreated={loadClaims}
              />
            )}

          <div className="card">
            <h3>Possible Matches</h3>

            {matchesLoading ? (
              <p className="muted">Finding possible matches...</p>
            ) : matches.length === 0 ? (
              <p className="muted">
                No strong matches found yet.
              </p>
            ) : (
              <div className="matches-list">
                {matches.map((match) => (
                  <MatchCard
                    key={match.item.id}
                    match={match}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {isOwner && (
        <section className="claims-section">
          <div className="section-heading">
            <h2>Claims on this item</h2>
            <span className="muted">
              {claims.length} claim{claims.length === 1 ? "" : "s"}
            </span>
          </div>

          {claimsLoading ? (
            <p className="muted">Loading claims...</p>
          ) : claims.length === 0 ? (
            <div className="empty-state card">
              <p className="muted">
                No one has claimed this item yet.
              </p>
            </div>
          ) : (
            <div className="claims-list">
              {claims.map((claim) => (
                <ClaimCard
                  key={claim.id}
                  claim={claim}
                  ownerView
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
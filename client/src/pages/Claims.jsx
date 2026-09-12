import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { claimService } from "../services/claimService.js";
import ClaimCard from "../components/ClaimCard.jsx";

export default function Claims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadClaims() {
    try {
      setLoading(true);
      setError("");

      const response = await claimService.getMine();
      setClaims(response.claims || []);
    } catch (err) {
      setError(err.message || "Failed to load claims.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClaims();
  }, []);

  if (loading) {
    return <div className="page-container">Loading claims...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <h1>My Claims</h1>
          <p className="muted">
            Track claims you have submitted.
          </p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {claims.length === 0 ? (
        <div className="empty-state card">
          <h3>No claims yet</h3>
          <p className="muted">
            When you submit a claim on an active report, it will appear here.
          </p>

          <Link to="/items" className="btn btn-primary">
            Browse Items
          </Link>
        </div>
      ) : (
        <div className="claims-list">
          {claims.map((claim) => (
            <div key={claim.id}>
              <ClaimCard claim={claim} />

              {claim.item && (
                <Link
                  to={`/items/${claim.item.id}`}
                  className="claim-item-link"
                >
                  View Item →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
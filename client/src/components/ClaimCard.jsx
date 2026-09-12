export default function ClaimCard({
  claim,
  ownerView = false,
  canModerate = false,
  onApprove,
  onReject,
  loading = false,
}) {
  return (
    <div className="claim-card card">
      <div className="claim-header">
        <div>
          <strong>
            {ownerView
              ? claim.claimant?.name || "User"
              : claim.item?.title || "Item"}
          </strong>

          {ownerView && claim.claimant?.email && (
            <div className="muted">{claim.claimant.email}</div>
          )}
        </div>

        <span className={`status-badge status-${claim.status.toLowerCase()}`}>
          {claim.status}
        </span>
      </div>

      <p className="claim-message">{claim.message}</p>

      <div className="muted claim-date">
        {claim.createdAt
          ? new Date(claim.createdAt).toLocaleString()
          : ""}
      </div>

      {canModerate && ownerView && claim.status === "PENDING" && (
        <div className="claim-actions">
          <button
            className="btn btn-primary"
            onClick={() => onApprove?.(claim.id)}
            disabled={loading}
          >
            Approve
          </button>

          <button
            className="btn btn-danger"
            onClick={() => onReject?.(claim.id)}
            disabled={loading}
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import { adminService } from "../services/adminService.js";
import { useAuth } from "../hooks/useAuth.js";

function groupClaimsByItem(claims) {
  return claims.reduce((groups, claim) => {
    const itemId = claim.item?.id;

    if (!itemId) {
      return groups;
    }

    if (!groups[itemId]) {
      groups[itemId] = {
        item: claim.item,
        claims: [],
      };
    }

    groups[itemId].claims.push(claim);
    return groups;
  }, {});
}

export default function Admin() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [claimRankings, setClaimRankings] = useState({});
  const [rankingItemId, setRankingItemId] = useState("");
  const [reportFilter, setReportFilter] = useState("FOUND");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadAdminData() {
    try {
      setLoading(true);
      setError("");

      const [
        dashboardResponse,
        usersResponse,
        itemsResponse,
        claimsResponse,
      ] = await Promise.all([
        adminService.getDashboard(),
        adminService.getUsers(),
        adminService.getItems(),
        adminService.getClaims(),
      ]);

      setStats(dashboardResponse.stats);
      setUsers(usersResponse.users || []);
      setItems(itemsResponse.items || []);
      setClaims(claimsResponse.claims || []);
    } catch (err) {
      setError(err.message || "Failed to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function handleUserToggle(targetUser) {
    try {
      setActionLoading(true);
      setError("");

      if (targetUser.disabled) {
        await adminService.enableUser(targetUser.id);
      } else {
        await adminService.disableUser(targetUser.id);
      }

      await loadAdminData();
    } catch (err) {
      setError(err.message || "Failed to update user.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteUser(targetUser) {
    if (!window.confirm(`Delete user "${targetUser.name}" and their reports?`)) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      await adminService.deleteUser(targetUser.id);
      await loadAdminData();
    } catch (err) {
      setError(err.message || "Failed to delete user.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteItem(item) {
    const confirmed = window.confirm(
      `Delete "${item.title}" permanently?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await adminService.deleteItem(item.id);

      await loadAdminData();
    } catch (err) {
      setError(err.message || "Failed to delete item.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleClaim(claim, status) {
    try {
      setActionLoading(true);
      setError("");

      await adminService.updateClaim(
        claim.id,
        status
      );

      await loadAdminData();
    } catch (err) {
      setError(err.message || "Failed to update claim.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRankClaims(itemId) {
    try {
      setRankingItemId(itemId);
      setError("");
      const response = await adminService.rankClaims(itemId);
      setClaimRankings((current) => ({
        ...current,
        [itemId]: response.data,
      }));
    } catch (err) {
      setError(err.message || "Failed to rank claims.");
    } finally {
      setRankingItemId("");
    }
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="page-container">
        <div className="alert error">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container">
        Loading admin dashboard...
      </div>
    );
  }

  const visibleItems = items.filter((item) =>
    reportFilter === "ALL" || item.type === reportFilter
  );
  const visibleClaims = claims.filter((claim) =>
    reportFilter === "ALL" || claim.item?.type === reportFilter
  );

  return (
    <div className="page-container admin-page">
      <div className="page-heading">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="muted">
            Manage users, items, and claims.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert error">
          {error}
        </div>
      )}

      {stats && (
        <section className="admin-stats">
          <div className="stat-card card">
            <span>Users</span>
            <strong>{stats.users.total}</strong>
            <small>
              {stats.users.active} active
            </small>
          </div>

          <div className="stat-card card">
            <span>Items</span>
            <strong>{stats.items.total}</strong>
            <small>
              {stats.items.active} active
            </small>
          </div>

          <div className="stat-card card">
            <span>Lost requests</span>
            <strong>{stats.items.lost}</strong>
            <small>Community reports</small>
          </div>

          <div className="stat-card card">
            <span>Found reports</span>
            <strong>{stats.items.found}</strong>
            <small>Community reports</small>
          </div>

          <div className="stat-card card">
            <span>Resolved</span>
            <strong>{stats.items.resolved}</strong>
          </div>

          <div className="stat-card card">
            <span>Pending Claims</span>
            <strong>{stats.claims.pending}</strong>
          </div>
        </section>
      )}

      <section className="admin-section">
        <div className="section-heading">
          <h2>Users</h2>
          <span className="muted">
            {users.length} users
          </span>
        </div>

        <div className="admin-table-wrapper card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Items</th>
                <th>Claims</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((targetUser) => (
                <tr key={targetUser.id}>
                  <td>
                    <strong>{targetUser.name}</strong>
                    <br />
                    <small>{targetUser.email}</small>
                  </td>

                  <td>{targetUser.role}</td>

                  <td>{targetUser._count.items}</td>

                  <td>{targetUser._count.claims}</td>

                  <td>
                    {targetUser.disabled
                      ? "Disabled"
                      : "Active"}
                  </td>

                  <td>
                    {targetUser.role === "ADMIN" ? (
                      <span className="muted">
                        Protected
                      </span>
                    ) : (
                      <>
                        <button
                          className="btn btn-small"
                          onClick={() =>
                            handleUserToggle(targetUser)
                          }
                          disabled={actionLoading}
                        >
                          {targetUser.disabled
                            ? "Enable"
                            : "Disable"}
                        </button>
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() =>
                            handleDeleteUser(targetUser)
                          }
                          disabled={actionLoading}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-section">
        <div className="section-heading">
          <h2>Items</h2>
          <div className="admin-filter-actions" role="group" aria-label="Report type">
            <button
              className={`btn btn-small ${reportFilter === "FOUND" ? "btn-primary" : "btn-secondary"}`}
              type="button"
              onClick={() => setReportFilter("FOUND")}
            >
              Found reports ({stats?.items.found ?? 0})
            </button>
            <button
              className={`btn btn-small ${reportFilter === "LOST" ? "btn-primary" : "btn-secondary"}`}
              type="button"
              onClick={() => setReportFilter("LOST")}
            >
              Lost requests ({stats?.items.lost ?? 0})
            </button>
            <button
              className={`btn btn-small ${reportFilter === "ALL" ? "btn-primary" : "btn-secondary"}`}
              type="button"
              onClick={() => setReportFilter("ALL")}
            >
              All ({items.length})
            </button>
          </div>
        </div>

        <div className="admin-table-wrapper card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Type</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Claims</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {visibleItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                    <br />
                    <small>{item.category}</small>
                  </td>

                  <td>{item.type}</td>

                  <td>
                    {item.user?.name}
                    <br />
                    <small>{item.user?.email}</small>
                  </td>

                  <td>{item.status}</td>

                  <td>{item._count.claims}</td>

                  <td>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() =>
                        handleDeleteItem(item)
                      }
                      disabled={actionLoading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-section">
        <div className="section-heading">
          <h2>Claims</h2>
          <span className="muted">
            {visibleClaims.length} claims for {reportFilter.toLowerCase()} reports
          </span>
        </div>

        <div className="claims-list">
          {visibleClaims.length === 0 ? (
            <div className="empty-state card">
              <p className="muted">
                No claims found.
              </p>
            </div>
          ) : (
            Object.values(groupClaimsByItem(visibleClaims)).map((group) => {
              const ranking = claimRankings[group.item.id];
              const rankingByClaimId = new Map(
                ranking?.ranking?.map((entry) => [
                  entry.claimId,
                  entry,
                ]) || []
              );
              const pendingClaims = group.claims.filter(
                (claim) => claim.status === "PENDING"
              );

              return (
                <section
                  key={group.item.id}
                  className="admin-claim-group"
                >
                  <div className="admin-claim-group-heading">
                    <div>
                      <h3>{group.item.title}</h3>
                      <span className="muted">
                        {pendingClaims.length} pending claim{pendingClaims.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    {pendingClaims.length > 1 && (
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() =>
                          handleRankClaims(group.item.id)
                        }
                        disabled={rankingItemId === group.item.id}
                      >
                        {rankingItemId === group.item.id
                          ? "Ranking..."
                          : "Rank claims with AI"}
                      </button>
                    )}
                  </div>

                  {ranking && (
                    <div className="ai-ranking-note">
                      <strong>
                        {ranking.source === "gemini"
                          ? "Gemini recommendation"
                          : "Local fallback ranking"}
                      </strong>
                      <span>
                        Review the statements yourself before approving a claim.
                        {ranking.limited && " Only the first 10 pending claims were analyzed."}
                        {ranking.warning && ` ${ranking.warning}`}
                      </span>
                    </div>
                  )}

                  {group.claims.map((claim) => {
                    const recommendation = rankingByClaimId.get(claim.id);

                    return (
                      <div key={claim.id} className="claim-card card">
                        <div className="claim-header">
                          <div>
                            <strong>{claim.claimant?.name}</strong>
                            <div className="muted">{claim.claimant?.email}</div>
                          </div>
                          <span className="status-badge">{claim.status}</span>
                        </div>

                        {recommendation && (
                          <div className="ai-claim-recommendation">
                            <strong>
                              AI rank #{recommendation.rank} · {recommendation.confidence || "REVIEW"}
                            </strong>
                            <p>{recommendation.reason}</p>
                          </div>
                        )}

                        <p className="claim-message">{claim.message}</p>

                        {claim.status === "PENDING" && (
                          <div className="claim-actions">
                            <button
                              className="btn btn-primary"
                              onClick={() => handleClaim(claim, "APPROVED")}
                              disabled={actionLoading}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleClaim(claim, "REJECTED")}
                              disabled={actionLoading}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </section>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
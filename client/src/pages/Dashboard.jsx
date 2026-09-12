import {
  Link
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth.js";

export default function Dashboard() {
  const {
    user
  } = useAuth();

  return (
    <main className="page">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">
            LOSTLINK
          </p>

          <h1>
            Welcome back,{" "}
            {user?.name}.
          </h1>

          <p>
            Report lost items, browse found items,
            and let LostLink identify possible matches.
          </p>
        </div>

        <div className="dashboard-actions">
          <Link
            className="button button-primary"
            to="/create"
          >
            Report an Item
          </Link>

          <Link
            className="button button-secondary"
            to="/items"
          >
            Browse Items
          </Link>
        </div>
      </section>

      <section className="dashboard-grid">
        <Link
          className="dashboard-card"
          to="/items?type=LOST"
        >
          <span className="dashboard-card-label">
            LOST
          </span>

          <h2>
            Find a lost item
          </h2>

          <p>
            Search reports from the community.
          </p>
        </Link>

        <Link
          className="dashboard-card"
          to="/items?type=FOUND"
        >
          <span className="dashboard-card-label">
            FOUND
          </span>

          <h2>
            Browse found items
          </h2>

          <p>
            See items that people have reported finding.
          </p>
        </Link>

        <Link
          className="dashboard-card"
          to="/matches"
        >
          <span className="dashboard-card-label">
            MATCHING
          </span>

          <h2>
            Check possible matches
          </h2>

          <p>
            Review reports that may describe the same item.
          </p>
        </Link>
      </section>
    </main>
  );
}
import {
  Link,
  NavLink,
  Outlet,
  useNavigate
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth.js";

export default function MainLayout() {
  const {
    user,
    isAdmin,
    logout
  } = useAuth();

  const navigate = useNavigate();

  async function handleLogout() {
    await logout();

    navigate("/login", {
      replace: true
    });
  }

  return (
    <div className="app-shell">
      <aside className="side-panel">
        <div className="side-panel-brand">
          <Link className="brand" to="/">
            LostLink
          </Link>
          <span>COMMUNITY HUB</span>
        </div>

        <nav className="side-nav" aria-label="Main navigation">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          {isAdmin ? (
            <NavLink to="/admin">
              Admin workspace
            </NavLink>
          ) : (
            <>
              <NavLink to="/items">Browse items</NavLink>
              <NavLink to="/create">Report an item</NavLink>
              <NavLink to="/matches">Matches</NavLink>
              <NavLink to="/claims">Claims</NavLink>
              <NavLink to="/profile">Profile</NavLink>
            </>
          )}
        </nav>

        <div className="side-panel-footer">
          {user && (
            <div className="signed-in-user">
              <span>Signed in as</span>
              <strong>{user.name}</strong>
            </div>
          )}
          <button
            className="logout-button"
            type="button"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </aside>

      <div className="shell-content">
        <header className="mobile-header">
          <Link className="brand" to="/">
            LostLink
          </Link>
          <button
            className="mobile-logout"
            type="button"
            onClick={handleLogout}
          >
            Log out
          </button>
        </header>

        <Outlet />

        <footer className="footer">
          <span>LostLink</span>
          <span>Find what was lost. Return what was found.</span>
        </footer>
      </div>
    </div>
  );
}
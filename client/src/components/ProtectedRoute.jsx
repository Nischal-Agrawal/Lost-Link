import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth.js";

function LoadingScreen() {
  return (
    <main className="page">
      <section className="card">
        <p>Loading...</p>
      </section>
    </main>
  );
}

export default function ProtectedRoute({
  adminOnly = false
}) {
  const {
    user,
    loading,
    isAuthenticated,
    isAdmin
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname
        }}
      />
    );
  }

  if (adminOnly && !isAdmin) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  if (!user) {
    return null;
  }

  return <Outlet />;
}
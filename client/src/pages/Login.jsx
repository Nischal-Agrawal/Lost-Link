import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth.js";

export default function Login() {
  const { login, isAuthenticated } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await login(form);

      const destination =
        location.state?.from || "/";

      navigate(destination, {
        replace: true
      });
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to log in"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <section className="card auth-card">
        <p className="eyebrow">WELCOME BACK</p>

        <h1>Login</h1>

        <p>
          Sign in to manage your lost and found
          reports.
        </p>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />

          <button
            className="button button-primary"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}
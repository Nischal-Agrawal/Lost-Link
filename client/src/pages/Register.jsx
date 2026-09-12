import { useEffect, useState } from "react";
import {
  Link,
  useNavigate
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth.js";

export default function Register() {
  const { register, isAuthenticated } = useAuth();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [confirmPassword, setConfirmPassword] =
    useState("");

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

    if (form.password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      await register(form);

      navigate("/", {
        replace: true
      });
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to create account"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <section className="card auth-card">
        <p className="eyebrow">JOIN LOSTLINK</p>

        <h1>Create account</h1>

        <p>
          Create an account to report and recover
          lost items.
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
          <label htmlFor="name">
            Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            minLength={2}
            maxLength={100}
            required
          />

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
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            minLength={8}
            maxLength={128}
            required
          />

          <label htmlFor="confirmPassword">
            Confirm password
          </label>

          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(
                event.target.value
              )
            }
            placeholder="Repeat your password"
            minLength={8}
            maxLength={128}
            required
          />

          <button
            className="button button-primary"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Creating account..."
              : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
import { useState } from "react";
import { claimService } from "../services/claimService.js";

export default function ClaimForm({ itemId, onCreated }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (message.trim().length < 10) {
      setError("Please provide at least 10 characters explaining why this item is yours.");
      return;
    }

    try {
      setLoading(true);

      await claimService.create(itemId, message.trim());

      setMessage("");
      setSuccess("Claim submitted successfully.");

      if (onCreated) {
        onCreated();
      }
    } catch (err) {
      setError(err.message || "Failed to submit claim.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="claim-form card">
      <h3>Claim this item</h3>

      <p className="muted">
        Explain details that can help the owner verify that this item belongs
        to you.
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="For example: I lost this bottle near the library. It has a small scratch near the cap..."
          rows={5}
          maxLength={1000}
          disabled={loading}
        />

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

        <button
          className="btn btn-primary"
          type="submit"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Claim"}
        </button>
      </form>
    </div>
  );
}
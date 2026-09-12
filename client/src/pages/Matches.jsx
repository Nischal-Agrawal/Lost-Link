import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useSearchParams
} from "react-router-dom";

import MatchCard from "../components/MatchCard.jsx";
import {
  getMatches
} from "../services/matchingService.js";

export default function Matches() {
  const [
    searchParams
  ] = useSearchParams();

  const itemId =
    searchParams.get(
      "itemId"
    );

  const [
    sourceItem,
    setSourceItem
  ] = useState(null);

  const [
    matches,
    setMatches
  ] = useState([]);

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadMatches() {
      if (!itemId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          await getMatches(
            itemId
          );

        if (!mounted) {
          return;
        }

        setSourceItem(
          response.data.sourceItem
        );

        setMatches(
          response.data.matches
        );
      } catch (requestError) {
        if (mounted) {
          setError(
            requestError.message ||
              "Unable to calculate matches"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadMatches();

    return () => {
      mounted = false;
    };
  }, [itemId]);

  if (!itemId) {
    return (
      <main className="page">
        <section className="empty-state">
          <p className="eyebrow">
            MATCHING
          </p>

          <h1>
            Select an item
          </h1>

          <p>
            Open an item and choose "View Possible
            Matches" to run the matching engine.
          </p>

          <Link
            className="button button-primary"
            to="/items"
          >
            Browse Items
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="page-heading">
        <p className="eyebrow">
          HYBRID MATCHING
        </p>

        <h1>
          Possible Matches
        </h1>

        {sourceItem && (
          <p>
            Matching candidates for{" "}
            <strong>
              {sourceItem.title}
            </strong>
            using structured fields, text similarity, and
            AI story analysis.
          </p>
        )}
      </section>

      {loading && (
        <section className="empty-state">
          <h2>
            Finding possible matches...
          </h2>

          <p>
            LostLink is comparing structured fields
            and local text similarity.
          </p>
        </section>
      )}

      {error && (
        <div
          className="form-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        matches.length === 0 && (
          <section className="empty-state">
            <h2>
              No useful matches found
            </h2>

            <p>
              No compatible active report currently
              has a strong enough similarity score.
            </p>
          </section>
        )}

      {!loading &&
        matches.length > 0 && (
          <>
            <div className="results-header">
              {matches.length} possible{" "}
              {matches.length === 1
                ? "match"
                : "matches"}{" "}
              found
            </div>

            <section className="match-list">
              {matches.map(
                (match) => (
                  <MatchCard
                    key={
                      match.item.id
                    }
                    match={match}
                  />
                )
              )}
            </section>
          </>
        )}
    </main>
  );
}
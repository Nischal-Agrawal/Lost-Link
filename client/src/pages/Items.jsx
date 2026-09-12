import {
  useEffect,
  useState
} from "react";

import {
  useSearchParams
} from "react-router-dom";

import ItemCard from "../components/ItemCard.jsx";
import {
  getItems
} from "../services/itemService.js";

const emptyFilters = {
  search: "",
  type: "",
  category: "",
  location: "",
  status: ""
};

export default function Items() {
  const [
    searchParams,
    setSearchParams
  ] = useSearchParams();

  const [
    filters,
    setFilters
  ] = useState({
    ...emptyFilters,
    search:
      searchParams.get("search") || "",
    type:
      searchParams.get("type") || "",
    category:
      searchParams.get("category") || "",
    location:
      searchParams.get("location") || "",
    status:
      searchParams.get("status") || ""
  });

  const [
    items,
    setItems
  ] = useState([]);

  const [
    pagination,
    setPagination
  ] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  async function loadItems(
    page = 1,
    activeFilters = filters
  ) {
    setLoading(true);
    setError("");

    try {
      const response =
        await getItems({
          ...activeFilters,
          page,
          limit: 12
        });

      setItems(
        response.data.items
      );

      setPagination(
        response.data.pagination
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to load items"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems(
      1,
      filters
    );
    // Initial query-string state only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(event) {
    const {
      name,
      value
    } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const params = {};

    for (const [
      key,
      value
    ] of Object.entries(filters)) {
      if (value) {
        params[key] = value;
      }
    }

    setSearchParams(params);

    loadItems(
      1,
      filters
    );
  }

  function handleClear() {
    setFilters(emptyFilters);
    setSearchParams({});
    loadItems(
      1,
      emptyFilters
    );
  }

  function handlePageChange(
    nextPage
  ) {
    if (
      nextPage < 1 ||
      nextPage >
        pagination.totalPages
    ) {
      return;
    }

    loadItems(
      nextPage,
      filters
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  return (
    <main className="page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">
            COMMUNITY REPORTS
          </p>

          <h1>
            Lost & Found Items
          </h1>

          <p>
            Search reports and find items that may match
            what you are looking for.
          </p>
        </div>
      </section>

      <section className="filters-card">
        <form
          className="filters-form"
          onSubmit={handleSubmit}
        >
          <div className="form-field filter-search">
            <label htmlFor="search">
              Search
            </label>

            <input
              id="search"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Search title, description, brand..."
            />
          </div>

          <div className="form-field">
            <label htmlFor="type">
              Type
            </label>

            <select
              id="type"
              name="type"
              value={filters.type}
              onChange={handleChange}
            >
              <option value="">
                All
              </option>

              <option value="LOST">
                Lost
              </option>

              <option value="FOUND">
                Found
              </option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="category">
              Category
            </label>

            <input
              id="category"
              name="category"
              value={filters.category}
              onChange={handleChange}
              placeholder="Category"
            />
          </div>

          <div className="form-field">
            <label htmlFor="location">
              Location
            </label>

            <input
              id="location"
              name="location"
              value={filters.location}
              onChange={handleChange}
              placeholder="Location"
            />
          </div>

          <div className="form-field">
            <label htmlFor="status">
              Status
            </label>

            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleChange}
            >
              <option value="">
                All
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="CLAIMED">
                Claimed
              </option>

              <option value="RESOLVED">
                Resolved
              </option>
            </select>
          </div>

          <div className="filter-actions">
            <button
              className="button button-primary"
              type="submit"
            >
              Search
            </button>

            <button
              className="button button-secondary"
              type="button"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div
          className="form-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {loading ? (
        <section className="empty-state">
          Loading items...
        </section>
      ) : items.length === 0 ? (
        <section className="empty-state">
          <h2>
            No items found
          </h2>

          <p>
            Try changing your search or filters.
          </p>
        </section>
      ) : (
        <>
          <div className="results-header">
            <span>
              {pagination.total} report
              {pagination.total === 1
                ? ""
                : "s"} found
            </span>
          </div>

          <section className="item-grid">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
              />
            ))}
          </section>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="button button-secondary"
                type="button"
                disabled={
                  pagination.page <= 1
                }
                onClick={() =>
                  handlePageChange(
                    pagination.page - 1
                  )
                }
              >
                Previous
              </button>

              <span>
                Page{" "}
                {pagination.page}{" "}
                of{" "}
                {pagination.totalPages}
              </span>

              <button
                className="button button-secondary"
                type="button"
                disabled={
                  pagination.page >=
                  pagination.totalPages
                }
                onClick={() =>
                  handlePageChange(
                    pagination.page + 1
                  )
                }
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
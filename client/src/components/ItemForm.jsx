import { useEffect, useState } from "react";

const initialForm = {
  type: "LOST",
  title: "",
  description: "",
  category: "",
  color: "",
  brand: "",
  location: "",
  date: "",
  imageUrl: ""
};

function toDateInputValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function ItemForm({
  initialValues,
  onSubmit,
  submitting = false,
  submitLabel = "Submit Report"
}) {
  const [form, setForm] =
    useState(initialForm);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!initialValues) {
      setForm(initialForm);
      return;
    }

    setForm({
      type:
        initialValues.type ||
        "LOST",
      title:
        initialValues.title ||
        "",
      description:
        initialValues.description ||
        "",
      category:
        initialValues.category ||
        "",
      color:
        initialValues.color ||
        "",
      brand:
        initialValues.brand ||
        "",
      location:
        initialValues.location ||
        "",
      date: toDateInputValue(
        initialValues.date
      ),
      imageUrl:
        initialValues.imageUrl ||
        ""
    });
  }, [initialValues]);

  function handleChange(event) {
    const {
      name,
      value
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!form.date) {
      setError(
        "Please select a date"
      );
      return;
    }

    try {
      await onSubmit({
        ...form,
        brand:
          form.brand.trim() ||
          null,
        imageUrl:
          form.imageUrl.trim() ||
          null
      });
    } catch (submitError) {
      setError(
        submitError.message ||
          "Unable to save the report"
      );
    }
  }

  return (
    <form
      className="item-form"
      onSubmit={handleSubmit}
    >
      {error && (
        <div
          className="form-error"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="type">
            Report Type
          </label>

          <select
            id="type"
            name="type"
            value={form.type}
            onChange={handleChange}
            required
          >
            <option value="LOST">
              Lost
            </option>

            <option value="FOUND">
              Found
            </option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="date">
            Date
          </label>

          <input
            id="date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="title">
          Title
        </label>

        <input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Black Nike Water Bottle"
          maxLength={150}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="description">
          Description
        </label>

        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the item and where it was lost or found."
          maxLength={3000}
          rows={5}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="category">
            Category
          </label>

          <input
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="e.g. Water Bottle"
            maxLength={100}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="color">
            Color
          </label>

          <input
            id="color"
            name="color"
            value={form.color}
            onChange={handleChange}
            placeholder="e.g. Black"
            maxLength={50}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="brand">
            Brand
          </label>

          <input
            id="brand"
            name="brand"
            value={form.brand}
            onChange={handleChange}
            placeholder="Optional"
            maxLength={100}
          />
        </div>

        <div className="form-field">
          <label htmlFor="location">
            Location
          </label>

          <input
            id="location"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g. Central Library"
            maxLength={200}
            required
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="imageUrl">
          Image URL
        </label>

        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          value={form.imageUrl}
          onChange={handleChange}
          placeholder="Optional image URL"
          maxLength={2000}
        />

        <small>
          Use a public image URL that can be opened without
          signing in. Broken links show a placeholder.
        </small>
      </div>

      <button
        className="button button-primary"
        type="submit"
        disabled={submitting}
      >
        {submitting
          ? "Saving..."
          : submitLabel}
      </button>
    </form>
  );
}
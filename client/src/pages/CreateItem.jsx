import {
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import ItemForm from "../components/ItemForm.jsx";
import {
  createItem
} from "../services/itemService.js";

export default function CreateItem() {
  const navigate =
    useNavigate();

  const [
    submitting,
    setSubmitting
  ] = useState(false);

  async function handleSubmit(data) {
    setSubmitting(true);

    try {
      const response =
        await createItem(data);

      navigate(
        `/items/${response.data.item.id}`,
        {
          replace: true
        }
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page narrow-page">
      <section className="page-heading">
        <p className="eyebrow">
          REPORT
        </p>

        <h1>
          Report a lost or found item
        </h1>

        <p>
          Provide enough detail to help the matching
          system identify similar reports.
        </p>
      </section>

      <section className="card">
        <ItemForm
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Create Report"
        />
      </section>
    </main>
  );
}
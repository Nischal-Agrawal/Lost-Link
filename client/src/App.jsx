import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Items from "./pages/Items.jsx";
import ItemDetails from "./pages/ItemDetails.jsx";
import CreateItem from "./pages/CreateItem.jsx";
import Matches from "./pages/Matches.jsx";
import Claims from "./pages/Claims.jsx";
import Admin from "./pages/Admin.jsx";

function Placeholder({ title }) {
  return (
    <div className="page-container">
      <div className="empty-state card">
        <h2>{title}</h2>
        <p className="muted">
          This section is coming soon.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          element={<ProtectedRoute />}
        >
          <Route element={<MainLayout />}>
            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/items"
              element={<Items />}
            />

            <Route
              path="/items/:id"
              element={<ItemDetails />}
            />

            <Route
              path="/create"
              element={<CreateItem />}
            />

            <Route
              path="/matches"
              element={<Matches />}
            />

            <Route
              path="/claims"
              element={<Claims />}
            />

            <Route
              path="/profile"
              element={<Placeholder title="Profile" />}
            />

            <Route
              path="/admin"
              element={<Admin />}
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={<Placeholder title="Page Not Found" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
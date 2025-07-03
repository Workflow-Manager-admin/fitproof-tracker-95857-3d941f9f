import React, { useContext } from "react";
import { AuthContext } from "../services/AuthContext";

// PUBLIC_INTERFACE
const DashboardPage = () => {
  /**
   * Minimal dashboard/home page for logged-in users.
   */
  const { currentUser, logout } = useContext(AuthContext);

  return (
    <div className="dashboard-container">
      <h1>Welcome, {currentUser?.sub || "User"}!</h1>
      <button onClick={logout}>Logout</button>
      <div style={{ marginTop: "2rem" }}>
        <a
          href="/profile"
          style={{
            padding: "12px 24px",
            background: "#007bff",
            borderRadius: "8px",
            color: "#fff",
            marginRight: "1rem",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Enter Profile (Height/Weight)
        </a>
        <a
          href="/exercise-recommend"
          style={{
            padding: "12px 24px",
            background: "#025fff",
            borderRadius: "8px",
            color: "#fff",
            textDecoration: "none",
            fontWeight: "bold",
            marginRight: "1rem"
          }}
        >
          Get Exercise Recommendations
        </a>
        <a
          href="/proof"
          style={{
            padding: "12px 24px",
            background: "#12b160",
            borderRadius: "8px",
            color: "#fff",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Upload Workout Proof
        </a>
      </div>
      {/* Future: add nav to exercise rec, proof, etc. */}
    </div>
  );
};

export default DashboardPage;

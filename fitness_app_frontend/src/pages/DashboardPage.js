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
      {/* Future: add nav to exercise rec, proof, etc. */}
    </div>
  );
};

export default DashboardPage;

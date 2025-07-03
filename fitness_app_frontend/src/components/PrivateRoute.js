import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";

// PUBLIC_INTERFACE
const PrivateRoute = ({ children }) => {
  /**
   * Restricts access to children if not authenticated (no currentUser in context).
   * Redirects to /login.
   */
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default PrivateRoute;

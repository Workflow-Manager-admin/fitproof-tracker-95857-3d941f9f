import React, { createContext, useState, useEffect } from "react";
/* eslint-disable */
const jwt_decode = require("jwt-decode");
import {
  loginUser,
  registerUser,
  storeToken,
  getToken,
  removeToken
} from "./authService";

// PUBLIC_INTERFACE
export const AuthContext = createContext();

// PUBLIC_INTERFACE
export const AuthProvider = ({ children }) => {
  /**
   * AuthProvider gives child components access to authentication state and methods.
   * Tracks logged in user; handles login, registration, and logout. 
   * Reloads state from localStorage on mount.
   */
  const [currentUser, setCurrentUser] = useState(null);

  // Load token from storage on mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const decoded = jwt_decode(token);
        setCurrentUser({ ...decoded, token });
      } catch (e) {
        setCurrentUser(null);
        removeToken();
      }
    }
  }, []);

  // Handle login
  const handleLogin = async (user) => {
    const data = await loginUser(user);
    if (data.token) {
      storeToken(data.token);
      const decoded = jwt_decode(data.token);
      setCurrentUser({ ...decoded, token: data.token });
      return { success: true };
    }
    return { success: false, error: data.detail || "Login failed" };
  };

  // Handle registration
  const handleRegister = async (user) => {
    const data = await registerUser(user);
    // Registration APIs may or may not return a token: if so, log in.
    if (data.token) {
      storeToken(data.token);
      const decoded = jwt_decode(data.token);
      setCurrentUser({ ...decoded, token: data.token });
      return { success: true };
    }
    // If no token, expect caller to redirect to login
    return { success: true, message: data.message || "Registration successful" };
  };

  // Handle logout
  const handleLogout = () => {
    removeToken();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login: handleLogin,
        logout: handleLogout,
        register: handleRegister,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

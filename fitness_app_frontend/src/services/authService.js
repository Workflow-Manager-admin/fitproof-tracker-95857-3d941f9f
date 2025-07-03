import axios from "axios";

// PUBLIC_INTERFACE
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://vscode-internal-3550-beta.beta01.cloud.kavia.ai:3001";

// PUBLIC_INTERFACE
export const registerUser = async ({ username, password }) => {
  /**
   * Registers a new user by sending username and password to the backend.
   * @param {Object} param0
   * @returns {Object} Response data (contains message or token)
   */
  const response = await axios.post(`${API_BASE_URL}/auth/register`, {
    username,
    password,
  });
  return response.data;
};

// PUBLIC_INTERFACE
export const loginUser = async ({ username, password }) => {
  /**
   * Logs a user in and expects JWT token in response.
   */
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    username,
    password,
  });
  return response.data;
};

// PUBLIC_INTERFACE
export const storeToken = (token) => {
  /**
   * Stores the JWT token securely in localStorage.
   */
  localStorage.setItem('jwt_token', token);
};

// PUBLIC_INTERFACE
export const getToken = () => {
  /**
   * Retrieves JWT token from localStorage.
   */
  return localStorage.getItem('jwt_token');
};

// PUBLIC_INTERFACE
export const removeToken = () => {
  /**
   * Removes JWT token from localStorage.
   */
  localStorage.removeItem('jwt_token');
};

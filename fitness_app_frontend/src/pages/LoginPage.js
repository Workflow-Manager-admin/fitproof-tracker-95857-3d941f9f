import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";

// PUBLIC_INTERFACE
const LoginPage = () => {
  /**
   * Login form: Sends credentials to login endpoint, stores JWT token, routes on success.
   */
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login(form);
      if (res.success) {
        navigate("/dashboard");
      } else {
        setError(res.error || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Login error.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          name="username"
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          autoComplete="username"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
        />
        <button type="submit">Login</button>
        {error && <div className="form-error">{error}</div>}
      </form>
      <div className="form-alt">
        Don't have an account? <Link to="/register">Register</Link>
      </div>
    </div>
  );
};

export default LoginPage;

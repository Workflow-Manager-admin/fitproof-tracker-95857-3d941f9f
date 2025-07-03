import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";

// PUBLIC_INTERFACE
const RegisterPage = () => {
  /**
   * Registration form for new users. Submits registration to backend via AuthContext.
   */
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    try {
      const res = await register(form);
      if (res.success) {
        setSuccessMsg("Registered successfully! Please login.");
        setTimeout(() => navigate("/login"), 1200);
      } else {
        setError(res.error || "Registration failed.");
      }
    } catch (err) {
      setError("Registration error.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
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
          autoComplete="new-password"
          minLength="6"
          required
        />
        <button type="submit">Register</button>
        {error && <div className="form-error">{error}</div>}
        {successMsg && <div className="form-success">{successMsg}</div>}
      </form>
      <div className="form-alt">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
};

export default RegisterPage;

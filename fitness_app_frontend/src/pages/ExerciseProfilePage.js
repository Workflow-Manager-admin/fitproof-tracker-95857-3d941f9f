import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";
import { API_BASE_URL } from "../services/authService";

// PUBLIC_INTERFACE
function ExerciseProfilePage() {
  /**
   * User enters height and weight for personalized profile.
   * Data is sent to backend for saving/updating (and for use in recommendations).
   * On submit, navigates to exercise recommendation.
   */
  const { currentUser } = useContext(AuthContext);
  const [form, setForm] = useState({ height: "", weight: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  // PUBLIC_INTERFACE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Endpoint to save user profile (height/weight)
      // Sample endpoint: POST /user/profile
      // If not implemented on backend, fallback to store in localStorage and proceed
      const token = currentUser?.token;
      const response = await axios.post(
        `${API_BASE_URL}/user/profile`,
        {
          height: +form.height,
          weight: +form.weight,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response && (response.status === 200 || response.status === 201)) {
        setLoading(false);
        navigate("/exercise-recommend");
        return;
      }
      setError("Could not save profile. Try again.");
    } catch (err) {
      setLoading(false);
      // If 404, fallback to storing and proceed
      if (err?.response?.status === 404) {
        // Fallback: store locally and continue
        localStorage.setItem(
          "profile",
          JSON.stringify({ height: form.height, weight: form.weight })
        );
        navigate("/exercise-recommend");
      } else {
        setError(
          err?.response?.data?.detail ||
            "Error saving profile. Please try again."
        );
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>Your Profile</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="number"
          name="height"
          placeholder="Height (cm)"
          value={form.height}
          onChange={handleChange}
          min={100}
          max={250}
          required
        />
        <input
          type="number"
          name="weight"
          placeholder="Weight (kg)"
          value={form.weight}
          onChange={handleChange}
          min={30}
          max={200}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save & Get Exercise"}
        </button>
        {error && <div className="form-error">{error}</div>}
      </form>
      <div className="form-alt">
        You must save your height/weight profile to get recommendations.
      </div>
    </div>
  );
}

export default ExerciseProfilePage;

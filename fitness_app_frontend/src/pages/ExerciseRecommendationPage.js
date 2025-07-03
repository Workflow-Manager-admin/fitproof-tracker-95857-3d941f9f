import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";
import { API_BASE_URL } from "../services/authService";

// PUBLIC_INTERFACE
function ExerciseRecommendationPage() {
  /**
   * Displays recommended exercises by fetching from backend.
   * Uses user's height/weight (from saved profile or localStorage fallback).
   */
  const { currentUser } = useContext(AuthContext);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Load profile (local fallback if backend/user_profile not found in BE)
  function getProfile() {
    try {
      const prof = localStorage.getItem("profile");
      if (!prof) return null;
      return JSON.parse(prof);
    } catch {
      return null;
    }
  }

  useEffect(() => {
    async function fetchRecommendations() {
      setLoading(true);
      setError("");
      let profile = null;
      // Optionally could fetch from BE: GET /user/profile
      // For now use local fallback, as profile was entered in previous step
      profile = getProfile();

      try {
        // POST to /exercise/recommend
        const token = currentUser?.token;
        if (!profile) {
          setLoading(false);
          setError("Profile required. Please enter height and weight.");
          return;
        }
        const response = await axios.post(
          `${API_BASE_URL}/exercise/recommend`,
          {
            height: +profile.height,
            weight: +profile.weight,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // API responds with { recommendations: [ ... ] }
        if (
          response &&
          response.data &&
          Array.isArray(response.data.recommendations)
        ) {
          setRecommendations(response.data.recommendations);
          setLoading(false);
        } else {
          setError("No exercise recommendations found.");
          setLoading(false);
        }
      } catch (err) {
        setError(
          err?.response?.data?.detail ||
            "Error getting recommendations. Please try again."
        );
        setLoading(false);
      }
    }
    fetchRecommendations();
    // eslint-disable-next-line
  }, []);

  function handleBackToProfile() {
    navigate("/profile");
  }

  return (
    <div className="dashboard-container">
      <h2>Recommended Exercises</h2>
      {loading && <div>Loading...</div>}
      {error && (
        <div className="form-error">
          {error}{" "}
          <button onClick={handleBackToProfile}>Edit Profile</button>
        </div>
      )}
      {!loading && !error && (
        <div>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {recommendations.map((exercise, idx) => (
              <li
                key={idx}
                style={{
                  background: "#f4f4f4",
                  marginBottom: "10px",
                  borderRadius: "14px",
                  padding: "1rem",
                  color: "#242424",
                  fontWeight: 500,
                  fontSize: "18px",
                }}
              >
                {exercise}
              </li>
            ))}
          </ul>
          {recommendations.length === 0 && (
            <div>No recommendations at this time.</div>
          )}
          <button className="theme-toggle" onClick={handleBackToProfile}>
            Back to Profile
          </button>
        </div>
      )}
    </div>
  );
}

export default ExerciseRecommendationPage;

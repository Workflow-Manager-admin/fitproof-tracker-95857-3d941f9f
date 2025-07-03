import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../services/AuthContext";
import { API_BASE_URL } from "../services/authService";

/**
 * WorkoutHistoryPage:
 * Shows the logged-in user's previous workout exercises, exercise types, upload time, and links to any workout proof media.
 * Data is fetched from backend GET /workout/history (JWT required).
 */
const WorkoutHistoryPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // PUBLIC_INTERFACE
  useEffect(() => {
    // Fetch workout history on mount
    async function fetchHistory() {
      setLoading(true);
      setError("");
      try {
        const token = currentUser?.token;
        const resp = await axios.get(
          `${API_BASE_URL}/workout/history`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        // Expect resp.data to be an array of workout entries
        if (resp && resp.data && Array.isArray(resp.data)) {
          setHistory(resp.data);
        } else {
          setError("No workout history found.");
        }
      } catch (err) {
        setError(
          err?.response?.data?.detail ||
          "Unable to fetch workout history. Please try again."
        );
      }
      setLoading(false);
    }
    fetchHistory();
    // eslint-disable-next-line
  }, []);

  // Helper to format ISO date
  function formatDate(isoString) {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toLocaleString();
  }

  return (
    <div className="dashboard-container">
      <h2>Workout History</h2>
      {loading && <div>Loading...</div>}
      {error && (
        <div className="form-error" style={{ marginBottom: "14px" }}>{error}</div>
      )}
      {!loading && !error && history.length === 0 && (
        <div>No workouts recorded yet.</div>
      )}
      {!loading && !error && history.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {history.map((wkt, idx) => (
              <li
                key={wkt.id || idx}
                style={{
                  background: "#f6f7fb",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "13px",
                  padding: "1rem",
                  boxShadow: "0 1px 5px rgba(140,140,140,0.06)",
                  marginBottom: 16,
                  gap: 18
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "1.14em" }}>
                    {wkt.exercise || "Exercise"}
                  </div>
                  <div style={{ color: "#7f7f9a", fontSize: "0.94em" }}>
                    {wkt.reps ? `Reps: ${wkt.reps}` : null}
                  </div>
                  {wkt.notes && (
                    <div style={{ color: "#6d7088", fontSize: "0.92em" }}>
                      Note: {wkt.notes}
                    </div>
                  )}
                  <div style={{ color: "#9da3b5", fontSize: "0.92em" }}>
                    Performed: {formatDate(wkt.timestamp)}
                  </div>
                  {typeof wkt.timer_seconds === "number" && (
                    <div style={{ color: "#b8bbb8", fontSize: "0.89em" }}>
                      Time: {wkt.timer_seconds}s
                    </div>
                  )}
                </div>
                {wkt.media_url && (
                  <div>
                    {wkt.media_url.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                      <a
                        href={wkt.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ borderRadius: "9px", display: "block" }}
                      >
                        <img
                          src={wkt.media_url}
                          alt="Workout Proof"
                          style={{
                            width: 80,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: "9px",
                            border: "1px solid #e9ecef"
                          }}
                        />
                      </a>
                    ) : (
                      <a
                        href={wkt.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          fontWeight: "bold",
                          color: "#007bff",
                          fontSize: "1.15em"
                        }}
                      >
                        📹 Watch Video
                      </a>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        className="theme-toggle"
        style={{ marginTop: 15 }}
        onClick={() => window.location.href = "/dashboard"}
      >Back to Dashboard</button>
    </div>
  );
};

export default WorkoutHistoryPage;

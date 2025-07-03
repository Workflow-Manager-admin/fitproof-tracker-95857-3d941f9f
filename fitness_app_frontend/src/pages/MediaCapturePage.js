import React, { useState, useRef, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";
import { API_BASE_URL } from "../services/authService";

/**
 * MediaCapturePage
 * Enables the user to capture proof of exercise using camera (photo or video), track a timer,
 * preview before upload, and then upload the result to the backend with proper metadata.
 */
const MediaCapturePage = () => {
  const [mediaStream, setMediaStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaType, setMediaType] = useState("photo"); // or "video"
  const [mediaBlob, setMediaBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [timer, setTimer] = useState(0); // seconds elapsed
  const [timerRunning, setTimerRunning] = useState(false);

  // Metadata input (optional for upload)
  const [exerciseMeta, setExerciseMeta] = useState({
    exercise: "",
    reps: "",
    notes: "",
  });

  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null); // for displaying live camera
  const timerInterval = useRef(null);

  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Start camera and optionally prepare for recording media
  const startCamera = async () => {
    setUploadStatus("");
    setMediaBlob(null);
    setPreviewUrl(null);
    setIsRecording(false);
    if (mediaStream) {
      // stop any previous tracks
      mediaStream.getTracks().forEach((track) => track.stop());
    }
    try {
      const constraints =
        mediaType === "video"
          ? { video: true, audio: true }
          : { video: true, audio: false };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setUploadStatus("Could not access camera. Please allow permission.");
    }
  };

  // Stop the camera when navigated away
  React.useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
      clearInterval(timerInterval.current);
    };
    // eslint-disable-next-line
  }, []);

  // Start the exercise timer
  const handleStartTimer = () => {
    if (timerRunning) return;
    setTimer(0);
    setTimerRunning(true);
    timerInterval.current = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
  };

  // Stop the exercise timer
  const handleStopTimer = () => {
    setTimerRunning(false);
    clearInterval(timerInterval.current);
  };

  // Take a photo using canvas snap
  const handleTakePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      setMediaBlob(blob);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    }, "image/jpeg");
    setUploadStatus("");
    // Stop the media stream to avoid camera "on" light
    if (mediaStream) mediaStream.getTracks().forEach((t) => t.stop());
  };

  // Start recording video
  const handleStartVideoRecording = () => {
    if (!mediaStream) return;
    if (isRecording) return;
    let recordedChunks = [];
    const recorder = new window.MediaRecorder(mediaStream, {
      mimeType: "video/webm",
    });

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      setMediaBlob(blob);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setIsRecording(false);
      // Shut off the camera, so it's not left on (privacy)
      if (mediaStream) mediaStream.getTracks().forEach((t) => t.stop());
    };

    mediaRecorderRef.current = recorder;
    recordedChunks = [];
    setIsRecording(true);
    setUploadStatus("");
    recorder.start();
  };

  // Stop recording and finalize the video
  const handleStopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Triggers upload to backend
  const handleUpload = async () => {
    if (!mediaBlob) return;
    setUploadStatus("Uploading...");
    const formData = new FormData();
    // Use field names expected by backend, e.g. 'file'
    formData.append("file", mediaBlob, mediaType === "photo" ? "proof.jpg" : "proof.webm");
    formData.append("timer_seconds", timer);
    formData.append("exercise", exerciseMeta.exercise || "");
    formData.append("reps", exerciseMeta.reps || "");
    formData.append("notes", exerciseMeta.notes || "");

    try {
      const resp = await axios.post(
        `${API_BASE_URL}/proof/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );
      setUploadStatus("Successfully uploaded!");
      // Optional: navigate or reset on success after a short delay
      setTimeout(() => navigate("/dashboard"), 1400);
    } catch (err) {
      setUploadStatus(
        err?.response?.data?.detail ||
          "Error uploading proof. Please try again."
      );
    }
  };

  // GENERAL: On page load, focus on camera immediately
  React.useEffect(() => {
    startCamera();
    // eslint-disable-next-line
  }, [mediaType]);

  // For UI input changes
  const handleMetaChange = (e) => {
    setExerciseMeta((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Helper to format timer (mm:ss)
  const formatTimer = (seconds) => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // =============== UI ===============
  return (
    <div className="dashboard-container">
      <h2>Proof of Workout</h2>
      <div style={{ margin: "10px 0 18px 0" }}>
        <button
          className={mediaType === "photo" ? "theme-toggle" : ""}
          onClick={() => setMediaType("photo")}
          disabled={isRecording}
        >
          📷 Photo
        </button>
        <button
          className={mediaType === "video" ? "theme-toggle" : ""}
          onClick={() => setMediaType("video")}
          disabled={isRecording}
          style={{ marginLeft: "1rem" }}
        >
          🎥 Video
        </button>
        <button
          onClick={startCamera}
          style={{ marginLeft: "2rem" }}
          disabled={isRecording}
        >
          Reset Camera
        </button>
      </div>
      <div>
        {/* Live Camera or Preview */}
        {!mediaBlob && (
          <div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              width={mediaType === "photo" ? 356 : 420}
              height={mediaType === "photo" ? 260 : 330}
              style={{
                borderRadius: "12px",
                border: "2px solid #e9ecef",
                background: "#252934",
                marginBottom: "10px",
              }}
            />
            <br />
            {mediaType === "photo" && (
              <button
                style={{ margin: "14px 0" }}
                onClick={handleTakePhoto}
                disabled={isRecording || !!mediaBlob}
              >
                Take Photo
              </button>
            )}
            {mediaType === "video" && (
              <>
                <button
                  style={{ margin: "14px 8px 0 0" }}
                  onClick={handleStartVideoRecording}
                  disabled={isRecording || !!mediaBlob}
                >
                  Start Recording
                </button>
                <button
                  style={{ margin: "14px 0" }}
                  onClick={handleStopVideoRecording}
                  disabled={!isRecording}
                >
                  Stop Recording
                </button>
              </>
            )}
          </div>
        )}
        {mediaBlob && (
          <div style={{ margin: "8px 0" }}>
            <div>Preview:</div>
            {mediaType === "photo" && (
              <img
                src={previewUrl}
                alt="Preview"
                width={356}
                height={260}
                style={{ borderRadius: "12px", border: "2px solid #e9ecef" }}
              />
            )}
            {mediaType === "video" && (
              <video
                src={previewUrl}
                width={420}
                height={320}
                controls
                style={{ borderRadius: "12px", border: "2px solid #e9ecef" }}
              />
            )}
            <br />
            <button
              onClick={() => {
                setMediaBlob(null);
                setPreviewUrl(null);
                setUploadStatus("");
                setTimer(0);
              }}
            >
              Retake
            </button>
          </div>
        )}
      </div>
      {/* Timer UI */}
      <div style={{ margin: "16px 0 10px 0" }}>
        <div>
          <span style={{ fontWeight: "bold" }}>⏱️ Timer:</span>{" "}
          <span style={{ fontSize: "1.6rem", letterSpacing: 1 }}>
            {formatTimer(timer)}
          </span>
        </div>
        <div style={{ marginTop: 8 }}>
          <button onClick={handleStartTimer} disabled={timerRunning}>
            Start
          </button>
          <button onClick={handleStopTimer} disabled={!timerRunning}>
            Stop
          </button>
        </div>
      </div>
      {/* Metadata input */}
      <form
        style={{
          background: "#f4f4fa",
          padding: "20px",
          borderRadius: "12px",
          margin: "10px auto 12px auto",
          maxWidth: "420px",
          textAlign: "left",
          boxShadow: "0 2px 6px rgba(99,99,140,0.11)",
        }}
        onSubmit={(e) => {
          e.preventDefault();
          if (mediaBlob) handleUpload();
        }}
      >
        <div>
          <label>
            Exercise Name:
            <input
              type="text"
              name="exercise"
              value={exerciseMeta.exercise}
              onChange={handleMetaChange}
              placeholder="E.g., Push-ups"
              style={{ marginLeft: 8, minWidth: 150 }}
            />
          </label>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>
            Repetitions:
            <input
              type="number"
              name="reps"
              value={exerciseMeta.reps}
              onChange={handleMetaChange}
              min={1}
              max={200}
              placeholder="Count"
              style={{ marginLeft: 8, width: 70 }}
            />
          </label>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>
            Notes:
            <input
              type="text"
              name="notes"
              value={exerciseMeta.notes}
              onChange={handleMetaChange}
              placeholder="Optional"
              style={{ marginLeft: 8, minWidth: 160 }}
            />
          </label>
        </div>
        <button
          type="submit"
          style={{
            marginTop: 16,
            width: "100%",
            background: "#007bff",
            color: "#fff",
            borderRadius: "8px",
            padding: "12px 0px",
            fontWeight: "bold",
            fontSize: "17px",
            border: "none",
            cursor: mediaBlob ? "pointer" : "not-allowed",
            opacity: mediaBlob ? 1 : 0.6,
          }}
          disabled={!mediaBlob}
        >
          Upload Proof
        </button>
        {uploadStatus && (
          <div
            style={{
              marginTop: 10,
              fontWeight: "bold",
              fontSize: "1rem",
              color:
                uploadStatus.includes("Error") ||
                uploadStatus.includes("Could not")
                  ? "#eb0023"
                  : "#12b160",
            }}
          >
            {uploadStatus}
          </div>
        )}
      </form>
      <button className="theme-toggle" style={{marginTop: "10px"}} onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </button>
      <div style={{color:"#848495", marginTop:8, fontSize:"0.97em"}}>
        Your photo/video will be securely uploaded as proof of your workout.
      </div>
    </div>
  );
};

export default MediaCapturePage;

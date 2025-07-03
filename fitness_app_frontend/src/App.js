import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './App.css';
import { AuthProvider } from './services/AuthContext';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PrivateRoute from './components/PrivateRoute';
import ExerciseProfilePage from './pages/ExerciseProfilePage';
import ExerciseRecommendationPage from './pages/ExerciseRecommendationPage';
import MediaCapturePage from './pages/MediaCapturePage';
import WorkoutHistoryPage from './pages/WorkoutHistoryPage';
// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <header className="App-header">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
            {/* Route content will be rendered below */}
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <ExerciseProfilePage />
                </PrivateRoute>
              } />
              <Route path="/exercise-recommend" element={
                <PrivateRoute>
                  <ExerciseRecommendationPage />
                </PrivateRoute>
              } />
              <Route path="/proof" element={
                <PrivateRoute>
                  <MediaCapturePage />
                </PrivateRoute>
              } />
              <Route path="/history" element={
                <PrivateRoute>
                  <WorkoutHistoryPage />
                </PrivateRoute>
              } />
              {/* Future: more protected/landing pages */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </header>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

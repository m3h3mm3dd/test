import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

// Layout
import Layout from './components/layout/Layout';

// Dashboard and main components
import Dashboard from './components/Dashboard';
import Projects from './components/projects/Projects';
import Tasks from './components/tasks/Tasks';
import Teams from './components/teams/Teams';
import UserProfile from './components/user/UserProfile';
import ChatPanel from './components/chat/ChatPanel';
import Settings from './components/settings/Settings';

// Auth pages
import LandingPage from './components/auth/LandingPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const App = () => {
  const { darkMode } = useTheme();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Effect to check if user is on an auth page but already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const authPaths = ['/', '/login', '/signup'];
      if (authPaths.includes(location.pathname)) {
        // Optional: you can add logic here if needed
      }
    }
  }, [isAuthenticated, location.pathname]);

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <Routes>
        {/* Public routes for authentication */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected routes inside Layout */}
        <Route path="/app" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="teams" element={<Teams />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="chat/:projectId" element={<ChatPanel projectName="Website Redesign" />} />
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Route>

        {/* Redirect any unknown routes to home or dashboard based on auth */}
        <Route path="*" element={
          isAuthenticated ? 
            <Navigate to="/app/dashboard" replace /> : 
            <Navigate to="/" replace />
        } />
      </Routes>
    </div>
  );
};

export default App;
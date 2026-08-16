import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AppProviders from './contexts/AppProviders';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import DashboardPage from './pages/DashboardPage';
import MySkillsPage from './pages/MySkillsPage';
import MatchingPage from './pages/MatchingPage';
import UserProfilePage from './pages/UserProfilePage';
import RequestsPage from './pages/RequestsPage';
import MessagesPage from './pages/MessagesPage';
import ScheduleSessionPage from './pages/ScheduleSessionPage';
import SessionsPage from './pages/SessionsPage';
import FeedbackPage from './pages/FeedbackPage';
import KarmaPage from './pages/KarmaPage';
import AskAIPage from './pages/AskAIPage';
import AdminPage from './pages/AdminPage';
import Header from './components/common/Header';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

const protectedRoutes = [
  { path: '/profile-setup', element: <ProfileSetupPage /> },
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/skills', element: <MySkillsPage /> },
  { path: '/matching', element: <MatchingPage /> },
  { path: '/profile/:userId', element: <UserProfilePage /> },
  { path: '/requests', element: <RequestsPage /> },
  { path: '/messages', element: <MessagesPage /> },
  { path: '/schedule', element: <ScheduleSessionPage /> },
  { path: '/sessions', element: <SessionsPage /> },
  { path: '/feedback', element: <FeedbackPage /> },
  { path: '/karma', element: <KarmaPage /> },
  { path: '/ask-ai', element: <AskAIPage /> },
];

function AppContent() {
  const { user, isBootstrapping } = useAuth();

  // Until the session check finishes we don't know whether the user is logged
  // in. Rendering routes now would briefly bounce an authenticated user to the
  // landing page before snapping back to the dashboard.
  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Header />}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
        <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />} />

        {protectedRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={<ProtectedRoute>{element}</ProtectedRoute>} />
        ))}

        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <Router>
          <AppContent />
        </Router>
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;

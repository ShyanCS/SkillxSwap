import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SkillsProvider } from './contexts/SkillsContext';
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
import Header from './components/common/Header';
import ProtectedRoute from './components/common/ProtectedRoute';

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Header />}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" /> : <ForgotPasswordPage />} />
        <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/skills" element={<ProtectedRoute><MySkillsPage /></ProtectedRoute>} />
        <Route path="/matching" element={<ProtectedRoute><MatchingPage /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="/schedule" element={<ProtectedRoute><ScheduleSessionPage /></ProtectedRoute>} />
        <Route path="/sessions" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
        <Route path="/karma" element={<ProtectedRoute><KarmaPage /></ProtectedRoute>} />
        <Route path="/ask-ai" element={<ProtectedRoute><AskAIPage /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SkillsProvider>
        <Router>
          <AppContent />
        </Router>
      </SkillsProvider>
    </AuthProvider>
  );
}

export default App;
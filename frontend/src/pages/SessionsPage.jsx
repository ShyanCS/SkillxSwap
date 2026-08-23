import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  PlayCircle,
  MessageCircle,
  Plus,
  Star,
} from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import logger from '../lib/logger';

const SessionsPage = () => {
  const { getSessions, cancelSession, completeSession } = useSession();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (error) {
      logger.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filterSessions = () => {
    return sessions.filter((session) => {
      if (activeTab === 'upcoming') return session.status === 'scheduled';
      if (activeTab === 'completed') return session.status === 'completed';
      if (activeTab === 'cancelled') return session.status === 'cancelled';
      return true;
    });
  };

  const handleJoinSession = (session) => {
    if (session.type === 'online' && session.location) {
      window.open(session.location, '_blank');
    }
  };

  const handleCancelSession = async (sessionId) => {
    try {
      await cancelSession(sessionId);
      await fetchSessions();
    } catch (error) {
      logger.error('Failed to cancel session:', error);
    }
  };

  const handleCompleteSession = async (sessionId) => {
    try {
      await completeSession(sessionId);
      await fetchSessions();
    } catch (error) {
      logger.error('Failed to complete session:', error);
    }
  };

  const SessionCard = ({ session }) => {
    const isUpcoming = new Date(session.startTime) > new Date();
    const canJoin =
      session.status === 'scheduled' &&
      Math.abs(new Date(session.startTime) - new Date()) <= 15 * 60 * 1000; // 15 minutes

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={
                session.partner.profilePictureUrl ||
                'https://ui-avatars.com/api/?name=' + encodeURIComponent(session.partner.name)
              }
              alt={session.partner.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{session.partner.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span>{session.partner.rating}</span>
                <span>•</span>
                <span
                  className={`${session.role === 'teacher' ? 'text-green-600' : 'text-blue-600'}`}
                >
                  You're the {session.role}
                </span>
              </div>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(session.status)}`}
          >
            {getStatusIcon(session.status)}
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </span>
        </div>

        {/* Session Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">{session.skill.name}</h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{formatDate(session.startTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                {formatTime(session.startTime)} - {formatTime(session.endTime)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {session.type === 'online' ? (
                <Video className="w-4 h-4 text-gray-400" />
              ) : (
                <MapPin className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-gray-600">
                {session.location || (session.type === 'online' ? 'Online' : '')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{session.duration} min</span>
            </div>
          </div>

          {session.notes && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 italic">"{session.notes}"</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Link
            to={`/profile/${session.partner.id}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            <User className="w-4 h-4" />
            View Profile
          </Link>

          <div className="flex gap-2">
            {session.status === 'scheduled' && (
              <>
                {canJoin && session.type === 'online' && (
                  <button
                    onClick={() => handleJoinSession(session)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-1"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Join Now
                  </button>
                )}

                {!isUpcoming && (
                  <button
                    onClick={() => handleCompleteSession(session.id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                  >
                    Mark Completed
                  </button>
                )}

                {isUpcoming && (
                  <button
                    onClick={() => handleCancelSession(session.id)}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm"
                  >
                    Cancel
                  </button>
                )}
              </>
            )}

            {session.status === 'completed' && (
              <Link
                to="/feedback"
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium flex items-center gap-1"
              >
                <Star className="w-4 h-4" />
                Give Feedback
              </Link>
            )}

            <Link
              to="/messages"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-1"
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const filteredSessions = filterSessions();

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Sessions</h1>
            <p className="text-gray-600">Manage your scheduled and completed learning sessions</p>
          </div>
          <Link
            to="/schedule"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 w-fit"
          >
            <Plus className="w-5 h-5" />
            Schedule Session
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter((s) => s.status === 'scheduled').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter((s) => s.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Teaching Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter((s) => s.role === 'teacher').length}
                </p>
              </div>
              <User className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Learning Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter((s) => s.role === 'learner').length}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <div className="flex justify-between items-center px-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'upcoming'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Upcoming ({sessions.filter((s) => s.status === 'scheduled').length})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'completed'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Completed ({sessions.filter((s) => s.status === 'completed').length})
                </button>
                <button
                  onClick={() => setActiveTab('cancelled')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'cancelled'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Cancelled ({sessions.filter((s) => s.status === 'cancelled').length})
                </button>
              </nav>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <p className="text-gray-500 text-center py-12">Loading sessions...</p>
            ) : filteredSessions.length > 0 ? (
              <div className="space-y-6">
                {filteredSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} sessions</h3>
                <p className="text-gray-500 mb-4">
                  {activeTab === 'upcoming'
                    ? "You don't have any upcoming sessions scheduled."
                    : `You don't have any ${activeTab} sessions.`}
                </p>
                {activeTab === 'upcoming' && (
                  <Link
                    to="/schedule"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Schedule Your First Session
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionsPage;

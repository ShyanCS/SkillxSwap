import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  User, 
  Star,
  CheckCircle,
  XCircle,
  PlayCircle,
  MessageCircle,
  Plus,
  Filter
} from 'lucide-react';

const SessionsPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock session data - replace with actual API calls
  const [sessions, setSessions] = useState([
    {
      id: '1',
      partner: {
        id: 'user1',
        name: 'Sarah Chen',
        profilePictureUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.9
      },
      skill: {
        name: 'React Development',
        description: 'Advanced React patterns and hooks'
      },
      role: 'learner', // 'learner' or 'teacher'
      startTime: '2024-01-20T15:00:00Z',
      endTime: '2024-01-20T16:00:00Z',
      duration: 60,
      type: 'online',
      location: 'Zoom Meeting',
      meetingLink: 'https://zoom.us/j/123456789',
      status: 'scheduled',
      notes: 'Focus on useEffect and performance optimization',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      partner: {
        id: 'user2',
        name: 'Miguel Rodriguez',
        profilePictureUrl: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.7
      },
      skill: {
        name: 'Machine Learning',
        description: 'Python ML fundamentals and scikit-learn'
      },
      role: 'learner',
      startTime: '2024-01-22T14:00:00Z',
      endTime: '2024-01-22T15:30:00Z',
      duration: 90,
      type: 'online',
      location: 'Google Meet',
      meetingLink: 'https://meet.google.com/xyz-abc-def',
      status: 'scheduled',
      notes: 'Introduction to supervised learning algorithms',
      createdAt: '2024-01-16T14:00:00Z'
    },
    {
      id: '3',
      partner: {
        id: 'user3',
        name: 'Emma Thompson',
        profilePictureUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 5.0
      },
      skill: {
        name: 'UI/UX Design',
        description: 'Design thinking and prototyping'
      },
      role: 'teacher',
      startTime: '2024-01-18T10:00:00Z',
      endTime: '2024-01-18T11:00:00Z',
      duration: 60,
      type: 'in-person',
      location: 'Central Library, Study Room 3',
      status: 'completed',
      notes: 'Covered design principles and user research',
      feedback: {
        rating: 5,
        comment: 'Excellent session! Very clear explanations.'
      },
      createdAt: '2024-01-10T09:00:00Z'
    },
    {
      id: '4',
      partner: {
        id: 'user4',
        name: 'Alex Johnson',
        profilePictureUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.8
      },
      skill: {
        name: 'Python Programming',
        description: 'Advanced Python concepts and best practices'
      },
      role: 'teacher',
      startTime: '2024-01-16T16:00:00Z',
      endTime: '2024-01-16T17:00:00Z',
      duration: 60,
      type: 'online',
      location: 'Zoom Meeting',
      status: 'cancelled',
      notes: 'Student had to cancel due to emergency',
      createdAt: '2024-01-14T11:00:00Z'
    }
  ]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
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
    return sessions.filter(session => {
      const now = new Date();
      const sessionDate = new Date(session.startTime);
      
      let statusMatch = true;
      if (activeTab === 'upcoming') {
        statusMatch = session.status === 'scheduled' && sessionDate >= now;
      } else if (activeTab === 'completed') {
        statusMatch = session.status === 'completed';
      } else if (activeTab === 'cancelled') {
        statusMatch = session.status === 'cancelled';
      }

      let filterMatch = true;
      if (filterStatus !== 'all') {
        filterMatch = session.status === filterStatus;
      }

      return statusMatch && filterMatch;
    });
  };

  const handleJoinSession = (session) => {
    if (session.meetingLink) {
      window.open(session.meetingLink, '_blank');
    }
  };

  const handleCancelSession = (sessionId) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? { ...session, status: 'cancelled' }
          : session
      )
    );
  };

  const SessionCard = ({ session }) => {
    const isUpcoming = new Date(session.startTime) > new Date();
    const canJoin = session.status === 'scheduled' && 
                   Math.abs(new Date(session.startTime) - new Date()) <= 15 * 60 * 1000; // 15 minutes

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={session.partner.profilePictureUrl}
              alt={session.partner.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{session.partner.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span>{session.partner.rating}</span>
                <span>•</span>
                <span className={`${
                  session.role === 'teacher' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  You're the {session.role}
                </span>
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(session.status)}`}>
            {getStatusIcon(session.status)}
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </span>
        </div>

        {/* Session Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">{session.skill.name}</h4>
          <p className="text-sm text-gray-600 mb-3">{session.skill.description}</p>
          
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
              <span className="text-gray-600">{session.location}</span>
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

        {/* Feedback (for completed sessions) */}
        {session.status === 'completed' && session.feedback && (
          <div className="bg-yellow-50 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">Feedback Received</span>
            </div>
            <p className="text-sm text-gray-700">"{session.feedback.comment}"</p>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < session.feedback.rating
                      ? 'text-yellow-500 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

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

            {session.status === 'completed' && !session.feedback && (
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
            <p className="text-gray-600">
              Manage your scheduled and completed learning sessions
            </p>
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
                  {sessions.filter(s => s.status === 'scheduled').length}
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
                  {sessions.filter(s => s.status === 'completed').length}
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
                  {sessions.filter(s => s.role === 'teacher').length}
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
                  {sessions.filter(s => s.role === 'learner').length}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Tabs and Filters */}
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
                  Upcoming ({sessions.filter(s => s.status === 'scheduled').length})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'completed'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Completed ({sessions.filter(s => s.status === 'completed').length})
                </button>
                <button
                  onClick={() => setActiveTab('cancelled')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'cancelled'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Cancelled ({sessions.filter(s => s.status === 'cancelled').length})
                </button>
              </nav>

              {/* <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Sessions</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div> */}
            </div>
          </div>

          <div className="p-6">
            {filteredSessions.length > 0 ? (
              <div className="space-y-6">
                {filteredSessions.map(session => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {activeTab} sessions
                </h3>
                <p className="text-gray-500 mb-4">
                  {activeTab === 'upcoming' 
                    ? "You don't have any upcoming sessions scheduled."
                    : `You don't have any ${activeTab} sessions.`
                  }
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
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../contexts/DashboardContext';
import {
  Users,
  MessageCircle,
  Calendar,
  Star,
  BookOpen,
  Coins,
  Plus,
  Bell,
  CheckCircle,
} from 'lucide-react';

const QUICK_ACTIONS = [
  {
    title: 'Find Matches',
    description: 'Discover new learning partners',
    icon: Users,
    color: 'bg-blue-500',
    link: '/matching',
  },
  {
    title: 'Add Skill',
    description: 'Offer a new skill to teach',
    icon: Plus,
    color: 'bg-green-500',
    link: '/skills',
  },
  {
    title: 'Schedule Session',
    description: 'Book a learning session',
    icon: Calendar,
    color: 'bg-purple-500',
    link: '/schedule',
  },
  {
    title: 'View Messages',
    description: 'Check your conversations',
    icon: MessageCircle,
    color: 'bg-orange-500',
    link: '/messages',
  },
];

const activityIcon = (type) => {
  if (type?.startsWith('MATCH')) return { Icon: Users, color: 'text-blue-600' };
  if (type?.startsWith('SESSION')) return { Icon: Calendar, color: 'text-green-600' };
  if (type?.startsWith('MESSAGE')) return { Icon: MessageCircle, color: 'text-purple-600' };
  if (type?.startsWith('REVIEW')) return { Icon: Star, color: 'text-yellow-600' };
  return { Icon: Bell, color: 'text-gray-500' };
};

const relativeTime = (iso) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString();
};

const sessionTime = (iso) => {
  const date = new Date(iso);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (date.toDateString() === today.toDateString()) return `Today, ${time}`;
  if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow, ${time}`;
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`;
};

const DashboardPage = () => {
  const { user } = useAuth();
  const { getDashboard } = useDashboard();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setData(await getDashboard());
      } catch (err) {
        setError(err.message || 'Could not load your dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = data?.stats;
  const upcomingSessions = data?.upcomingSessions ?? [];
  const recentActivity = data?.recentActivity ?? [];

  const statCards = [
    {
      label: 'Skill Credits',
      value: stats?.creditBalance,
      icon: Coins,
      tint: 'bg-yellow-100',
      fg: 'text-yellow-600',
      hint: 'Earned by teaching',
    },
    {
      label: 'Matches',
      value: stats?.activeMatches,
      icon: Users,
      tint: 'bg-blue-100',
      fg: 'text-blue-600',
      hint: 'Accepted connections',
    },
    {
      label: 'Completed Sessions',
      value: stats?.completedSessions,
      icon: CheckCircle,
      tint: 'bg-green-100',
      fg: 'text-green-600',
      hint: 'Taught or learned',
    },
    {
      label: 'Skills Exchange',
      value: stats ? `${stats.skillsOffered}/${stats.skillsRequested}` : undefined,
      icon: BookOpen,
      tint: 'bg-purple-100',
      fg: 'text-purple-600',
      hint: 'Offering/Learning',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  {loading
                    ? 'Loading your activity…'
                    : stats
                      ? `You have ${stats.activeMatches} match${stats.activeMatches === 1 ? '' : 'es'} and ${stats.completedSessions} completed session${stats.completedSessions === 1 ? '' : 's'}.`
                      : 'Your learning journey starts here.'}
                </p>
              </div>
              <div className="hidden md:block">
                <img
                  src={
                    user?.profilePictureUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`
                  }
                  alt={user?.name}
                  className="w-20 h-20 rounded-full border-4 border-white/20 object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map(({ label, value, icon: Icon, tint, fg, hint }) => (
            <div key={label} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '—' : (value ?? 0)}</p>
                </div>
                <div className={`${tint} p-3 rounded-full`}>
                  <Icon className={`w-6 h-6 ${fg}`} />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">{hint}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {QUICK_ACTIONS.map((action) => (
                  <Link
                    key={action.link}
                    to={action.link}
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <div className={`${action.color} p-3 rounded-full text-white mb-2`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-medium text-gray-900 text-center">{action.title}</h3>
                    <p className="text-sm text-gray-500 text-center mt-1">{action.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
                <Link
                  to="/sessions"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all
                </Link>
              </div>

              {loading ? (
                <p className="text-gray-500 py-6 text-center">Loading…</p>
              ) : upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-gray-100"
                    >
                      <img
                        src={
                          session.partner.profilePictureUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(session.partner.name)}`
                        }
                        alt={session.partner.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{session.skill.name}</h3>
                        <p className="text-sm text-gray-500">with {session.partner.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {sessionTime(session.startTime)}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            session.role === 'teacher'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {session.role === 'teacher' ? 'Teaching' : 'Learning'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-3">No upcoming sessions scheduled.</p>
                  <Link
                    to="/schedule"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Schedule one →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm h-fit">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            {loading ? (
              <p className="text-gray-500 py-6 text-center">Loading…</p>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const { Icon, color } = activityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex gap-3">
                      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${color}`} />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">{relativeTime(activity.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  No activity yet. Send a match request to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  Star, 
  BookOpen, 
  Target,
  TrendingUp,
  Clock,
  Award,
  Plus
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  // Mock data - replace with actual data from API
  const stats = {
    activeMatches: 5,
    completedSessions: 12,
    karmaPoints: user?.karmaPoints || 450,
    skillsOffered: 3,
    skillsRequested: 2
  };

  const recentActivity = [
    {
      id: 1,
      type: 'match',
      message: 'New match found for React development',
      time: '2 hours ago',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'session',
      message: 'Session completed with Sarah Chen',
      time: '1 day ago',
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      id: 3,
      type: 'message',
      message: 'New message from Miguel Rodriguez',
      time: '2 days ago',
      icon: MessageCircle,
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'feedback',
      message: 'Received 5-star feedback from Emma Thompson',
      time: '3 days ago',
      icon: Star,
      color: 'text-yellow-600'
    }
  ];

  const upcomingSessions = [
    {
      id: 1,
      title: 'React Hooks Deep Dive',
      partner: 'Sarah Chen',
      time: 'Today, 3:00 PM',
      type: 'teaching',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      title: 'UI/UX Design Principles',
      partner: 'Miguel Rodriguez',
      time: 'Tomorrow, 10:00 AM',
      type: 'learning',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const quickActions = [
    {
      title: 'Find Matches',
      description: 'Discover new learning partners',
      icon: Users,
      color: 'bg-blue-500',
      link: '/matching'
    },
    {
      title: 'Add Skill',
      description: 'Offer a new skill to teach',
      icon: Plus,
      color: 'bg-green-500',
      link: '/skills'
    },
    {
      title: 'Schedule Session',
      description: 'Book a learning session',
      icon: Calendar,
      color: 'bg-purple-500',
      link: '/schedule'
    },
    {
      title: 'View Messages',
      description: 'Check your conversations',
      icon: MessageCircle,
      color: 'bg-orange-500',
      link: '/messages'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  Your learning journey continues. You have {stats.activeMatches} active matches and {stats.completedSessions} completed sessions.
                </p>
              </div>
              <div className="hidden md:block">
                <img
                  src={user?.profilePictureUrl || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400'}
                  alt={user?.name}
                  className="w-20 h-20 rounded-full border-4 border-white/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Karma Points</p>
                <p className="text-2xl font-bold text-gray-900">{stats.karmaPoints}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500 text-sm">+25 this week</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Matches</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeMatches}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-blue-500 text-sm">2 new this week</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedSessions}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-green-500 text-sm">3 this month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Skills Exchange</p>
                <p className="text-2xl font-bold text-gray-900">{stats.skillsOffered}/{stats.skillsRequested}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-gray-500 text-sm">Offering/Learning</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
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
                <Link to="/sessions" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View all
                </Link>
              </div>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map(session => (
                    <div key={session.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <img
                        src={session.avatar}
                        alt={session.partner}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{session.title}</h3>
                        <p className="text-sm text-gray-600">with {session.partner}</p>
                        <div className="flex items-center mt-1">
                          <Clock className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-500">{session.time}</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        session.type === 'teaching' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {session.type === 'teaching' ? 'Teaching' : 'Learning'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No upcoming sessions</p>
                  <Link to="/schedule" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Schedule your first session
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start">
                    <div className={`${activity.color} mr-3 mt-1`}>
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Learning Progress</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">React Development</span>
                    <span className="text-gray-500">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">UI/UX Design</span>
                    <span className="text-gray-500">40%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">Machine Learning</span>
                    <span className="text-gray-500">20%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '20%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
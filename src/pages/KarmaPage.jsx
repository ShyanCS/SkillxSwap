import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Award, 
  TrendingUp, 
  Star, 
  Calendar, 
  User, 
  BookOpen,
  Trophy,
  Target,
  Clock,
  CheckCircle,
  Medal
} from 'lucide-react';

const KarmaPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock karma data - replace with actual API calls
  const karmaData = {
    totalKarma: user?.karmaPoints || 450,
    weeklyChange: +25,
    monthlyChange: +85,
    rank: 'Expert',
    nextRankPoints: 550,
    breakdown: {
      sessionsCompleted: 180,
      feedbackReceived: 150,
      helpfulReviews: 65,
      skillSharing: 35,
      communityContribution: 20
    }
  };

  const recentActivity = [
    {
      id: '1',
      type: 'session_completed',
      description: 'Completed teaching session: React Development',
      points: +15,
      date: '2024-01-20T10:00:00Z',
      partner: 'Sarah Chen'
    },
    {
      id: '2',
      type: 'feedback_received',
      description: 'Received 5-star feedback from Miguel Rodriguez',
      points: +10,
      date: '2024-01-19T15:30:00Z',
      partner: 'Miguel Rodriguez'
    },
    {
      id: '3',
      type: 'session_completed',
      description: 'Completed learning session: Machine Learning',
      points: +10,
      date: '2024-01-18T14:00:00Z',
      partner: 'Emma Thompson'
    },
    {
      id: '4',
      type: 'helpful_review',
      description: 'Your review was marked helpful by the community',
      points: +5,
      date: '2024-01-17T09:00:00Z'
    },
    {
      id: '5',
      type: 'skill_added',
      description: 'Added new skill: Python Programming',
      points: +5,
      date: '2024-01-16T11:00:00Z'
    }
  ];

  const achievements = [
    {
      id: '1',
      title: 'Teaching Master',
      description: 'Completed 50+ teaching sessions',
      icon: BookOpen,
      unlocked: true,
      progress: 100,
      badge: 'gold'
    },
    {
      id: '2',
      title: 'Student Star',
      description: 'Completed 25+ learning sessions',
      icon: Star,
      unlocked: true,
      progress: 100,
      badge: 'silver'
    },
    {
      id: '3',
      title: 'Feedback Champion',
      description: 'Received 100+ positive reviews',
      icon: Trophy,
      unlocked: true,
      progress: 100,
      badge: 'gold'
    },
    {
      id: '4',
      title: 'Community Helper',
      description: 'Help 100 community members',
      icon: User,
      unlocked: false,
      progress: 75,
      badge: 'platinum'
    },
    {
      id: '5',
      title: 'Skill Collector',
      description: 'Master 10 different skills',
      icon: Target,
      unlocked: false,
      progress: 60,
      badge: 'diamond'
    },
    {
      id: '6',
      title: 'Time Keeper',
      description: 'Complete 100 hours of sessions',
      icon: Clock,
      unlocked: false,
      progress: 85,
      badge: 'platinum'
    }
  ];

  const leaderboard = [
    { rank: 1, name: 'Alice Johnson', karma: 1250, avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { rank: 2, name: 'Bob Smith', karma: 980, avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { rank: 3, name: 'Carol Davis', karma: 750, avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { rank: 4, name: 'David Wilson', karma: 680, avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { rank: 5, name: 'You', karma: karmaData.totalKarma, avatar: user?.profilePictureUrl, isCurrentUser: true },
    { rank: 6, name: 'Frank Miller', karma: 420, avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { rank: 7, name: 'Grace Lee', karma: 380, avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400' }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'session_completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'feedback_received':
        return <Star className="w-4 h-4 text-yellow-600" />;
      case 'helpful_review':
        return <Trophy className="w-4 h-4 text-purple-600" />;
      case 'skill_added':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      default:
        return <Award className="w-4 h-4 text-gray-600" />;
    }
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'gold':
        return 'bg-yellow-500';
      case 'silver':
        return 'bg-gray-400';
      case 'platinum':
        return 'bg-purple-500';
      case 'diamond':
        return 'bg-blue-500';
      default:
        return 'bg-bronze-500';
    }
  };

  const AchievementCard = ({ achievement }) => (
    <div className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-all ${
      achievement.unlocked
        ? 'border-green-200 bg-green-50'
        : 'border-gray-200'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-full ${
          achievement.unlocked ? 'bg-green-100' : 'bg-gray-100'
        }`}>
          <achievement.icon className={`w-6 h-6 ${
            achievement.unlocked ? 'text-green-600' : 'text-gray-400'
          }`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-medium ${
              achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {achievement.title}
            </h3>
            {achievement.unlocked && (
              <div className={`w-3 h-3 rounded-full ${getBadgeColor(achievement.badge)}`} />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                achievement.unlocked ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${achievement.progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {achievement.progress}% Complete
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Karma & Reputation</h1>
          <p className="text-gray-600">
            Track your contributions and achievements in the SkillSwap community
          </p>
        </div>

        {/* Karma Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-8 h-8" />
              <span className="text-blue-100 text-sm font-medium">{karmaData.rank}</span>
            </div>
            <div className="text-3xl font-bold mb-1">{karmaData.totalKarma}</div>
            <div className="text-blue-100 text-sm">Total Karma Points</div>
            <div className="mt-3 text-xs text-blue-100">
              {karmaData.nextRankPoints - karmaData.totalKarma} points to next rank
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">+{karmaData.weeklyChange}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-green-600 mt-2">Great progress!</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">+{karmaData.monthlyChange}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-blue-600 mt-2">Excellent month!</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Global Rank</p>
                <p className="text-2xl font-bold text-gray-900">#5</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-sm text-yellow-600 mt-2">Top 10 user!</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'achievements'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Achievements
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'leaderboard'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Leaderboard
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Karma Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Karma Breakdown</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-green-800">Sessions Completed</span>
                      <span className="text-green-600 font-bold">{karmaData.breakdown.sessionsCompleted} pts</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="font-medium text-yellow-800">Feedback Received</span>
                      <span className="text-yellow-600 font-bold">{karmaData.breakdown.feedbackReceived} pts</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium text-purple-800">Helpful Reviews</span>
                      <span className="text-purple-600 font-bold">{karmaData.breakdown.helpfulReviews} pts</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-blue-800">Skill Sharing</span>
                      <span className="text-blue-600 font-bold">{karmaData.breakdown.skillSharing} pts</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-800">Community Contribution</span>
                      <span className="text-gray-600 font-bold">{karmaData.breakdown.communityContribution} pts</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {recentActivity.map(activity => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          {activity.partner && (
                            <p className="text-xs text-gray-500">with {activity.partner}</p>
                          )}
                          <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                        </div>
                        <div className={`text-sm font-medium ${
                          activity.points > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {activity.points > 0 ? '+' : ''}{activity.points}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Your Achievements</h3>
                  <span className="text-sm text-gray-500">
                    {achievements.filter(a => a.unlocked).length} of {achievements.length} unlocked
                  </span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map(achievement => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <div>
                <h3 className="text-lg font-semibold mb-6">Community Leaderboard</h3>
                <div className="space-y-3">
                  {leaderboard.map(entry => (
                    <div key={entry.rank} className={`flex items-center gap-4 p-4 rounded-lg border ${
                      entry.isCurrentUser
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        entry.rank === 1 ? 'bg-yellow-500 text-white' :
                        entry.rank === 2 ? 'bg-gray-400 text-white' :
                        entry.rank === 3 ? 'bg-orange-500 text-white' :
                        entry.isCurrentUser ? 'bg-blue-600 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {entry.rank <= 3 ? <Medal className="w-4 h-4" /> : entry.rank}
                      </div>
                      <img
                        src={entry.avatar}
                        alt={entry.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          entry.isCurrentUser ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {entry.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {entry.karma} karma points
                        </p>
                      </div>
                      {entry.isCurrentUser && (
                        <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                          You
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KarmaPage;
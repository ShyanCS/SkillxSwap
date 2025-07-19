import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  MapPin, 
  Clock, 
  Star, 
  BookOpen, 
  Target, 
  MessageCircle,
  Send,
  Award,
  TrendingUp,
  X,
  Check
} from 'lucide-react';

const UserProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedTeachSkill, setSelectedTeachSkill] = useState('');
  const [selectedLearnSkill, setSelectedLearnSkill] = useState('');
  const [requestMessage, setRequestMessage] = useState('');

  // Mock user data - replace with actual API call
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock profile data
      const mockProfile = {
        id: userId,
        name: 'Sarah Chen',
        bio: 'Full-stack developer with 5 years experience. Love teaching and learning new technologies. Passionate about creating beautiful user interfaces and sharing knowledge with the community.',
        region: 'North America',
        timezone: 'EST',
        profilePictureUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
        karmaPoints: 520,
        rating: 4.9,
        totalSessions: 35,
        totalStudents: 28,
        joinedDate: 'January 2024',
        learningGoals: ['Advanced React Patterns', 'Node.js Performance', 'System Design'],
        skillsOffered: [
          {
            id: '1',
            name: 'React Development',
            description: 'Modern React with hooks, context, and best practices. I can teach component architecture, state management, and performance optimization.',
            proficiencyLevel: 'Advanced',
            availability: ['Monday PM', 'Wednesday PM', 'Friday AM'],
            sessionCount: 15
          },
          {
            id: '2',
            name: 'JavaScript ES6+',
            description: 'Modern JavaScript features, async programming, and functional programming concepts.',
            proficiencyLevel: 'Advanced',
            availability: ['Tuesday AM', 'Thursday PM'],
            sessionCount: 12
          },
          {
            id: '3',
            name: 'Frontend Testing',
            description: 'Unit testing with Jest, integration testing, and end-to-end testing strategies.',
            proficiencyLevel: 'Intermediate',
            availability: ['Saturday AM'],
            sessionCount: 8
          }
        ],
        skillsRequested: [
          {
            id: '1',
            name: 'UI/UX Design',
            description: 'Want to improve my design skills for better user interfaces and user experience.',
            desiredProficiency: 'Intermediate',
            urgency: 'Medium'
          },
          {
            id: '2',
            name: 'DevOps & Deployment',
            description: 'Looking to learn Docker, Kubernetes, and modern deployment strategies.',
            desiredProficiency: 'Beginner',
            urgency: 'High'
          }
        ],
        recentFeedback: [
          {
            id: '1',
            giver: 'Alex Johnson',
            rating: 5,
            comment: 'Excellent React teacher! Very patient and explains concepts clearly.',
            skill: 'React Development',
            date: '2 days ago'
          },
          {
            id: '2',
            giver: 'Maria Garcia',
            rating: 5,
            comment: 'Helped me understand JavaScript fundamentals. Highly recommended!',
            skill: 'JavaScript ES6+',
            date: '1 week ago'
          },
          {
            id: '3',
            giver: 'David Kim',
            rating: 4,
            comment: 'Great session on testing. Looking forward to more sessions.',
            skill: 'Frontend Testing',
            date: '2 weeks ago'
          }
        ]
      };
      
      setUserProfile(mockProfile);
      setLoading(false);
    };

    fetchUserProfile();
  }, [userId]);

  const handleSendMatchRequest = () => {
    if (!selectedTeachSkill || !selectedLearnSkill) {
      alert('Please select both skills for the exchange');
      return;
    }

    // Mock sending match request
    console.log('Sending match request:', {
      teachSkill: selectedTeachSkill,
      learnSkill: selectedLearnSkill,
      message: requestMessage
    });

    alert('Match request sent successfully!');
    setShowMatchModal(false);
    navigate('/requests');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-300 rounded mb-4 w-1/3"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2 w-2/3"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 pt-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">User not found</h2>
            <p className="text-gray-600">The user profile you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <img
              src={userProfile.profilePictureUrl}
              alt={userProfile.name}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{userProfile.name}</h1>
                  <div className="flex items-center gap-4 text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{userProfile.region}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{userProfile.timezone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{userProfile.rating} rating</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowMatchModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Match Request
                </button>
              </div>
              <p className="text-gray-700 mb-4">{userProfile.bio}</p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{userProfile.karmaPoints}</div>
                  <div className="text-sm text-blue-800">Karma Points</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{userProfile.totalSessions}</div>
                  <div className="text-sm text-green-800">Sessions</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600">{userProfile.totalStudents}</div>
                  <div className="text-sm text-purple-800">Students</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{userProfile.rating}</div>
                  <div className="text-sm text-yellow-800">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skills Offered */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold">Skills They Offer</h2>
              </div>
              <div className="space-y-4">
                {userProfile.skillsOffered.map(skill => (
                  <div key={skill.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                          {skill.proficiencyLevel}
                        </span>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {skill.sessionCount} sessions
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{skill.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {skill.availability.map(slot => (
                        <span key={slot} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Requested */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold">Skills They Want to Learn</h2>
              </div>
              <div className="space-y-4">
                {userProfile.skillsRequested.map(skill => (
                  <div key={skill.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                          Target: {skill.desiredProficiency}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          skill.urgency === 'High' ? 'bg-red-100 text-red-800' :
                          skill.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {skill.urgency} Priority
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{skill.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learning Goals */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Learning Goals</h3>
              <div className="space-y-2">
                {userProfile.learningGoals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">{goal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Feedback */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Recent Feedback</h3>
              <div className="space-y-4">
                {userProfile.recentFeedback.map(feedback => (
                  <div key={feedback.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-gray-900">{feedback.giver}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < feedback.rating
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">"{feedback.comment}"</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{feedback.skill}</span>
                      <span>{feedback.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Match Request Modal */}
        {showMatchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Send Match Request</h2>
                  <button
                    onClick={() => setShowMatchModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-gray-600 mt-2">
                  Select what you want to learn from {userProfile.name} and what you can teach in return.
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* What you want to learn */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What do you want to learn from {userProfile.name}?
                  </label>
                  <select
                    value={selectedLearnSkill}
                    onChange={(e) => setSelectedLearnSkill(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a skill they offer</option>
                    {userProfile.skillsOffered.map(skill => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name} ({skill.proficiencyLevel})
                      </option>
                    ))}
                  </select>
                </div>

                {/* What you can teach */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What can you teach in return?
                  </label>
                  <select
                    value={selectedTeachSkill}
                    onChange={(e) => setSelectedTeachSkill(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a skill you offer</option>
                    {/* Mock current user's skills - replace with actual data */}
                    <option value="1">UI/UX Design (Intermediate)</option>
                    <option value="2">Python Programming (Advanced)</option>
                    <option value="3">Digital Marketing (Beginner)</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Introduce yourself and explain why you'd like to connect..."
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    onClick={() => setShowMatchModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendMatchRequest}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                  >
                    Send Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
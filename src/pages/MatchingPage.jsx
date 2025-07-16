import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  Star, 
  MapPin, 
  Clock, 
  Filter, 
  Search, 
  Users, 
  MessageCircle,
  TrendingUp,
  Zap
} from 'lucide-react';

const MatchingPage = () => {
  const [filters, setFilters] = useState({
    skillName: '',
    proficiency: '',
    region: '',
    timezone: '',
    availability: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Mock matches data - replace with actual API data
  const [matches, setMatches] = useState([
    {
      id: '1',
      user: {
        id: 'user1',
        name: 'Sarah Chen',
        bio: 'Full-stack developer with 5 years experience. Love teaching and learning new technologies.',
        region: 'North America',
        timezone: 'EST',
        profilePictureUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
        karmaPoints: 520,
        rating: 4.9
      },
      skillOffered: {
        name: 'React Development',
        proficiencyLevel: 'Advanced',
        description: 'Modern React with hooks, context, and best practices'
      },
      skillRequested: {
        name: 'UI/UX Design',
        desiredProficiency: 'Intermediate',
        description: 'Want to improve my design skills for better user interfaces'
      },
      compatibilityScore: 95,
      mutualInterests: ['Web Development', 'JavaScript', 'Frontend'],
      lastActive: '2 hours ago'
    },
    {
      id: '2',
      user: {
        id: 'user2',
        name: 'Miguel Rodriguez',
        bio: 'Data scientist passionate about machine learning and Python. Always eager to share knowledge.',
        region: 'South America',
        timezone: 'EST',
        profilePictureUrl: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400',
        karmaPoints: 380,
        rating: 4.7
      },
      skillOffered: {
        name: 'Machine Learning',
        proficiencyLevel: 'Advanced',
        description: 'ML fundamentals, neural networks, and practical applications'
      },
      skillRequested: {
        name: 'React Development',
        desiredProficiency: 'Intermediate',
        description: 'Want to build better web interfaces for my ML projects'
      },
      compatibilityScore: 88,
      mutualInterests: ['Python', 'Data Science', 'Technology'],
      lastActive: '1 day ago'
    },
    {
      id: '3',
      user: {
        id: 'user3',
        name: 'Emma Thompson',
        bio: 'Product manager with design background. Love helping others grow their product skills.',
        region: 'Europe',
        timezone: 'GMT',
        profilePictureUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400',
        karmaPoints: 670,
        rating: 5.0
      },
      skillOffered: {
        name: 'Product Management',
        proficiencyLevel: 'Advanced',
        description: 'Product strategy, user research, and agile methodologies'
      },
      skillRequested: {
        name: 'Data Analytics',
        desiredProficiency: 'Beginner',
        description: 'Want to use data to make better product decisions'
      },
      compatibilityScore: 82,
      mutualInterests: ['Product Design', 'Strategy', 'User Experience'],
      lastActive: '3 hours ago'
    },
    {
      id: '4',
      user: {
        id: 'user4',
        name: 'Alex Kim',
        bio: 'Digital marketing specialist with expertise in SEO and content strategy.',
        region: 'Asia',
        timezone: 'JST',
        profilePictureUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400',
        karmaPoints: 290,
        rating: 4.6
      },
      skillOffered: {
        name: 'Digital Marketing',
        proficiencyLevel: 'Intermediate',
        description: 'SEO, content marketing, and social media strategies'
      },
      skillRequested: {
        name: 'Python Programming',
        desiredProficiency: 'Beginner',
        description: 'Want to automate marketing tasks and analyze data'
      },
      compatibilityScore: 78,
      mutualInterests: ['Marketing', 'Analytics', 'Growth'],
      lastActive: '5 hours ago'
    }
  ]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      skillName: '',
      proficiency: '',
      region: '',
      timezone: '',
      availability: ''
    });
  };

  const MatchCard = ({ match }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-all duration-200">
      {/* Compatibility Score Badge */}
      <div className="flex justify-between items-start mb-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
          match.compatibilityScore >= 90 ? 'bg-green-100 text-green-800' :
          match.compatibilityScore >= 80 ? 'bg-blue-100 text-blue-800' :
          match.compatibilityScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          <Zap className="w-4 h-4" />
          {match.compatibilityScore}% Match
        </div>
        <span className="text-sm text-gray-500">{match.lastActive}</span>
      </div>

      {/* User Info */}
      <div className="flex items-start gap-4 mb-4">
        <img
          src={match.user.profilePictureUrl}
          alt={match.user.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{match.user.name}</h3>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm text-gray-600">{match.user.rating}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{match.user.bio}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{match.user.region}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{match.user.timezone}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>{match.user.karmaPoints} karma</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Exchange */}
      <div className="border-t border-gray-100 pt-4 mb-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* They Offer */}
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800">They Offer</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-1">{match.skillOffered.name}</h4>
            <p className="text-sm text-gray-600 mb-2">{match.skillOffered.description}</p>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
              {match.skillOffered.proficiencyLevel}
            </span>
          </div>

          {/* You Want */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-800">You Want</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-1">{match.skillRequested.name}</h4>
            <p className="text-sm text-gray-600 mb-2">{match.skillRequested.description}</p>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
              Target: {match.skillRequested.desiredProficiency}
            </span>
          </div>
        </div>
      </div>

      {/* Mutual Interests */}
      {match.mutualInterests.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Mutual Interests:</p>
          <div className="flex flex-wrap gap-2">
            {match.mutualInterests.map((interest, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link
          to={`/profile/${match.user.id}`}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium text-center transition-colors"
        >
          View Profile
        </Link>
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Send Request
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI-Powered Matching</h1>
          </div>
          <p className="text-gray-600">
            Discover perfect learning partners based on your skills and interests
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Matches</p>
                <p className="text-2xl font-bold text-gray-900">{matches.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-green-600 mt-2">+3 new this week</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Compatibility</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(matches.reduce((sum, match) => sum + match.compatibilityScore, 0) / matches.length)}%
                </p>
              </div>
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-sm text-blue-600 mt-2">High quality matches</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900">89%</p>
              </div>
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-green-600 mt-2">Excellent engagement</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by skill name..."
                  value={filters.skillName}
                  onChange={(e) => handleFilterChange('skillName', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proficiency
                </label>
                <select
                  value={filters.proficiency}
                  onChange={(e) => handleFilterChange('proficiency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region
                </label>
                <select
                  value={filters.region}
                  onChange={(e) => handleFilterChange('region', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Regions</option>
                  <option value="North America">North America</option>
                  <option value="South America">South America</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia">Asia</option>
                  <option value="Africa">Africa</option>
                  <option value="Oceania">Oceania</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <select
                  value={filters.timezone}
                  onChange={(e) => handleFilterChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Timezones</option>
                  <option value="EST">EST</option>
                  <option value="CST">CST</option>
                  <option value="MST">MST</option>
                  <option value="PST">PST</option>
                  <option value="GMT">GMT</option>
                  <option value="CET">CET</option>
                  <option value="JST">JST</option>
                  <option value="AEST">AEST</option>
                  <option value="IST">IST</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Matches Grid */}
        <div className="grid gap-6 mb-8">
          {matches.length > 0 ? (
            matches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or add more skills to your profile
              </p>
              <Link
                to="/skills"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Manage Skills
              </Link>
            </div>
          )}
        </div>

        {/* Load More */}
        {matches.length > 0 && (
          <div className="text-center mb-8">
            <button className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg border border-gray-300 font-medium transition-colors">
              Load More Matches
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchingPage;
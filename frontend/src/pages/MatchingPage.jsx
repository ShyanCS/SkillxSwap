import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMatch } from '../contexts/MatchContext';
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
  const { getMatches, sendMatchRequest, hasAlreadyRequested } = useMatch();
  const [filters, setFilters] = useState({
    skillName: '',
    proficiency: '',
    region: '',
    timezone: '',
    availability: ''
  });
  const [matches, setMatches] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const matchesData = await getMatches();
        setMatches(matchesData);
      } catch (error) {
        console.error("Failed to fetch skills:", error);
      }
    };
    fetchMatches();
  }, []);

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

  const MatchCard = ({ match }) => {
    const [sending, setSending] = useState(false);
    const [alreadyRequested, setAlreadyRequested] = useState(false);

    useEffect(() => {
      const checkAlready = async () => {
        const result = await hasAlreadyRequested(match.user.id);
        setAlreadyRequested(result);
      };
      checkAlready();
    }, [match.user.id]);

    const handleSendRequest = async () => {
      try {
        setSending(true);
        await sendMatchRequest(
          match.user.id,
          match.skillsOffered.map(skill => skill.id || skill.userSkillId),
          match.skillsRequested.map(skill => skill.id || skill.userSkillId)
        );
        alert("Match request sent!");
        setAlreadyRequested(true);
      } catch (err) {
        alert(err.message || "Failed to send request");
      } finally {
        setSending(false);
      }
    };

    return (
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

        {/* Skills */}
        <div className="border-t border-gray-100 pt-4 mb-4">
          <div className="grid md:grid-cols-2 gap-4">
            {match.skillsOffered.map((skill, i) => (
              <div key={i} className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">They Offer</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{skill.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                  {skill.proficiencyLevel}
                </span>
              </div>
            ))}
            {match.skillsRequested.map((skill, i) => (
              <div key={i} className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800">They Want</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{skill.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  Target: {skill.desiredProficiency}
                </span>
              </div>
            ))}
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
          <button
            disabled={alreadyRequested || sending}
            onClick={handleSendRequest}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              alreadyRequested
                ? "bg-gray-300 cursor-not-allowed text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            {alreadyRequested ? "Request Sent" : (sending ? "Sending..." : "Send Request")}
          </button>
        </div>
      </div>
    );
  };

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
                  {matches.length > 0
                    ? Math.round(matches.reduce((sum, match) => sum + match.compatibilityScore, 0) / matches.length)
                    : 0}%
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

        {/* Filters */}
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

        {/* Matches */}
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
      </div>
    </div>
  );
};

export default MatchingPage;

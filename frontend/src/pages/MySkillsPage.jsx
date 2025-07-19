import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  BookOpen, 
  Target, 
  Clock, 
  TrendingUp,
  Star,
  Users
} from 'lucide-react';

const MySkillsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('offered');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('offer'); // 'offer' or 'request'
  
  // Mock data - replace with actual data from API
  const [offeredSkills, setOfferedSkills] = useState([
    {
      id: '1',
      name: 'React Development',
      description: 'Full-stack React development including hooks, context, and modern patterns',
      proficiencyLevel: 'Advanced',
      availability: ['Monday PM', 'Wednesday PM', 'Friday AM'],
      status: 'Active',
      matchCount: 5,
      sessionCount: 12
    },
    {
      id: '2',
      name: 'UI/UX Design',
      description: 'User interface and experience design using Figma and Adobe Creative Suite',
      proficiencyLevel: 'Intermediate',
      availability: ['Tuesday AM', 'Thursday PM', 'Saturday AM'],
      status: 'Active',
      matchCount: 3,
      sessionCount: 8
    },
    {
      id: '3',
      name: 'Python Programming',
      description: 'Python programming for web development and data analysis',
      proficiencyLevel: 'Intermediate',
      availability: ['Monday AM', 'Friday PM'],
      status: 'Archived',
      matchCount: 2,
      sessionCount: 5
    }
  ]);

  const [requestedSkills, setRequestedSkills] = useState([
    {
      id: '1',
      name: 'Machine Learning',
      description: 'Want to learn ML fundamentals, neural networks, and practical applications',
      desiredProficiency: 'Intermediate',
      urgency: 'High',
      status: 'Active',
      matchCount: 2
    },
    {
      id: '2',
      name: 'Digital Marketing',
      description: 'Social media marketing, SEO, and content strategy',
      desiredProficiency: 'Beginner',
      urgency: 'Medium',
      status: 'Active',
      matchCount: 4
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    proficiencyLevel: 'Intermediate',
    desiredProficiency: 'Intermediate',
    urgency: 'Medium',
    availability: []
  });

  const proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced'];
  const urgencyLevels = ['Low', 'Medium', 'High'];
  const availabilityOptions = [
    'Monday AM', 'Monday PM', 'Tuesday AM', 'Tuesday PM',
    'Wednesday AM', 'Wednesday PM', 'Thursday AM', 'Thursday PM',
    'Friday AM', 'Friday PM', 'Saturday AM', 'Saturday PM',
    'Sunday AM', 'Sunday PM'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleAvailability = (slot) => {
    const current = formData.availability;
    const updated = current.includes(slot)
      ? current.filter(s => s !== slot)
      : [...current, slot];
    
    handleInputChange('availability', updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newSkill = {
      id: Date.now().toString(),
      ...formData,
      status: 'Active',
      matchCount: 0,
      sessionCount: modalType === 'offer' ? 0 : undefined
    };

    if (modalType === 'offer') {
      setOfferedSkills(prev => [...prev, newSkill]);
    } else {
      setRequestedSkills(prev => [...prev, newSkill]);
    }

    // Reset form
    setFormData({
      name: '',
      description: '',
      proficiencyLevel: 'Intermediate',
      desiredProficiency: 'Intermediate',
      urgency: 'Medium',
      availability: []
    });
    setShowAddModal(false);
  };

  const openAddModal = (type) => {
    setModalType(type);
    setShowAddModal(true);
  };

  const deleteSkill = (skillId, type) => {
    if (type === 'offer') {
      setOfferedSkills(prev => prev.filter(skill => skill.id !== skillId));
    } else {
      setRequestedSkills(prev => prev.filter(skill => skill.id !== skillId));
    }
  };

  const SkillCard = ({ skill, type, onDelete }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{skill.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              skill.status === 'Active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {skill.status}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-3">{skill.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {type === 'offer' ? (
              <>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  {skill.proficiencyLevel}
                </span>
                {skill.availability?.map(slot => (
                  <span key={slot} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {slot}
                  </span>
                ))}
              </>
            ) : (
              <>
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
              </>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{skill.matchCount} matches</span>
            </div>
            {type === 'offer' && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{skill.sessionCount} sessions</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
            <Edit3 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(skill.id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Skills</h1>
          <p className="text-gray-600">
            Manage the skills you offer to teach and want to learn
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Skills Offered</p>
                <p className="text-2xl font-bold text-gray-900">{offeredSkills.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Skills Requested</p>
                <p className="text-2xl font-bold text-gray-900">{requestedSkills.length}</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Matches</p>
                <p className="text-2xl font-bold text-gray-900">
                  {offeredSkills.reduce((sum, skill) => sum + skill.matchCount, 0) +
                   requestedSkills.reduce((sum, skill) => sum + skill.matchCount, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sessions Taught</p>
                <p className="text-2xl font-bold text-gray-900">
                  {offeredSkills.reduce((sum, skill) => sum + skill.sessionCount, 0)}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('offered')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'offered'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Skills I Offer ({offeredSkills.length})
              </button>
              <button
                onClick={() => setActiveTab('requested')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'requested'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Skills I Want to Learn ({requestedSkills.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Add Skill Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTab === 'offered' ? 'Skills You Offer' : 'Skills You Want to Learn'}
              </h2>
              <button
                onClick={() => openAddModal(activeTab === 'offered' ? 'offer' : 'request')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'offered'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add {activeTab === 'offered' ? 'Skill to Teach' : 'Skill to Learn'}
              </button>
            </div>

            {/* Skills Grid */}
            <div className="grid gap-6">
              {activeTab === 'offered' ? (
                offeredSkills.length > 0 ? (
                  offeredSkills.map(skill => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      type="offer"
                      onDelete={(id) => deleteSkill(id, 'offer')}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No skills offered yet</h3>
                    <p className="text-gray-500 mb-4">Start by adding a skill you can teach to others</p>
                    <button
                      onClick={() => openAddModal('offer')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Add Your First Skill
                    </button>
                  </div>
                )
              ) : (
                requestedSkills.length > 0 ? (
                  requestedSkills.map(skill => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      type="request"
                      onDelete={(id) => deleteSkill(id, 'request')}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No learning goals yet</h3>
                    <p className="text-gray-500 mb-4">Add skills you want to learn from the community</p>
                    <button
                      onClick={() => openAddModal('request')}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Add Learning Goal
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Add Skill Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {modalType === 'offer' ? 'Add Skill to Teach' : 'Add Skill to Learn'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skill Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., React Development, Machine Learning, Guitar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={modalType === 'offer' 
                      ? "Describe your expertise and what you can teach..."
                      : "Describe what you want to learn and your goals..."
                    }
                  />
                </div>

                {modalType === 'offer' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Proficiency Level
                      </label>
                      <select
                        value={formData.proficiencyLevel}
                        onChange={(e) => handleInputChange('proficiencyLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {proficiencyLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Availability
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {availabilityOptions.map(slot => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => toggleAvailability(slot)}
                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                              formData.availability.includes(slot)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Desired Proficiency Level
                      </label>
                      <select
                        value={formData.desiredProficiency}
                        onChange={(e) => handleInputChange('desiredProficiency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {proficiencyLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urgency
                      </label>
                      <select
                        value={formData.urgency}
                        onChange={(e) => handleInputChange('urgency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {urgencyLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                      modalType === 'offer'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    Add Skill
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySkillsPage;
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSkills } from '../contexts/SkillsContext';
import { Plus, Edit3, Trash2, BookOpen, Target, Clock, Star, Users } from 'lucide-react';
import SkillFormModal from '../components/skills/SkillFormModal';
import logger from '../lib/logger';

const MySkillsPage = () => {
  const { user, fetchUserDetails } = useAuth();
  const { addSkill, getSkill, deleteSkill, updateSkill } = useSkills();
  const [activeTab, setActiveTab] = useState('offered');
  // null means the modal is closed; an object holds the skill being edited.
  const [modalState, setModalState] = useState(null); // { type, skill }
  const [reloadFlag, setReloadFlag] = useState(false);

  const [offeredSkills, setOfferedSkills] = useState([]);
  const [requestedSkills, setRequestedSkills] = useState([]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const [offeredData, requestedData] = await Promise.all([getSkill('offer'), getSkill('request')]);
        setOfferedSkills(offeredData);
        setRequestedSkills(requestedData);
      } catch (error) {
        logger.error('Failed to fetch skills:', error);
      }
    };

    if (user) fetchSkills();
  }, [user, reloadFlag]);

  const refreshAfterChange = async () => {
    // Refresh user data to get updated skill arrays
    await fetchUserDetails();
    setReloadFlag((prev) => !prev);
  };

  const handleSaveSkill = async (editId, payload) => {
    if (editId) {
      await updateSkill(editId, payload);
    } else {
      await addSkill(payload);
    }
    await refreshAfterChange();
  };

  const handleDeleteSkill = async (skillId) => {
    await deleteSkill(skillId);
    await refreshAfterChange();
  };

  const SkillCard = ({ skill, type, onDelete }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{skill.name}</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                skill.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
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
                {skill.availability?.map((slot) => (
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
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    skill.urgency === 'High'
                      ? 'bg-red-100 text-red-800'
                      : skill.urgency === 'Medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}
                >
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
          <button
            onClick={() => setModalState({ type: skill.type, skill })}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          >
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
          <p className="text-gray-600">Manage the skills you offer to teach and want to learn</p>
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
                onClick={() => setModalState({ type: activeTab === 'offered' ? 'offer' : 'request', skill: null })}
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
                  offeredSkills.map((skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      type="offer"
                      onDelete={(id) => handleDeleteSkill(id)}
                    />
                  ))
                ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No skills offered yet</h3>
                  <p className="text-gray-500 mb-4">Start by adding a skill you can teach to others</p>
                  <button
                    onClick={() => setModalState({ type: 'offer', skill: null })}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Add Your First Skill
                  </button>
                </div>
                )
              ) : requestedSkills.length > 0 ? (
                requestedSkills.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    type="request"
                    onDelete={(id) => handleDeleteSkill(id)}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No learning goals yet</h3>
                  <p className="text-gray-500 mb-4">Add skills you want to learn from the community</p>
                  <button
                    onClick={() => setModalState({ type: 'request', skill: null })}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Add Learning Goal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add/Edit Skill Modal */}
        {modalState && (
          <SkillFormModal
            type={modalState.type}
            initial={modalState.skill}
            onClose={() => setModalState(null)}
            onSave={handleSaveSkill}
          />
        )}
      </div>
    </div>
  );
};

export default MySkillsPage;

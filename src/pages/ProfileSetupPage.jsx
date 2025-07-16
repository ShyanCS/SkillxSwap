import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plus, X, User, MapPin, Clock, BookOpen, Target } from 'lucide-react';

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    region: user?.region || '',
    timezone: user?.timezone || '',
    learningGoals: user?.learningGoals || [],
    skillsToTeach: [],
    skillsToLearn: [],
  });

  const [skillInput, setSkillInput] = useState({
    teach: { name: '', description: '', proficiency: 'Intermediate', availability: [] },
    learn: { name: '', description: '', urgency: 'Medium', desiredProficiency: 'Intermediate' },
  });

  const regions = [
    'North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania'
  ];

  const timezones = [
    'EST', 'CST', 'MST', 'PST', 'GMT', 'CET', 'JST', 'AEST', 'IST'
  ];

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

  const addLearningGoal = (goal) => {
    if (goal && !formData.learningGoals.includes(goal)) {
      handleInputChange('learningGoals', [...formData.learningGoals, goal]);
    }
  };

  const removeLearningGoal = (goal) => {
    handleInputChange('learningGoals', formData.learningGoals.filter(g => g !== goal));
  };

  const addSkillToTeach = () => {
    const { name, description, proficiency, availability } = skillInput.teach;
    if (name && description && availability.length > 0) {
      const newSkill = {
        id: Date.now().toString(),
        name,
        description,
        type: 'offer',
        proficiencyLevel: proficiency,
        availability,
        status: 'Active'
      };
      setFormData(prev => ({
        ...prev,
        skillsToTeach: [...prev.skillsToTeach, newSkill]
      }));
      setSkillInput(prev => ({
        ...prev,
        teach: { name: '', description: '', proficiency: 'Intermediate', availability: [] }
      }));
    }
  };

  const addSkillToLearn = () => {
    const { name, description, urgency, desiredProficiency } = skillInput.learn;
    if (name && description) {
      const newSkill = {
        id: Date.now().toString(),
        name,
        description,
        type: 'request',
        urgency,
        desiredProficiency,
        status: 'Active'
      };
      setFormData(prev => ({
        ...prev,
        skillsToLearn: [...prev.skillsToLearn, newSkill]
      }));
      setSkillInput(prev => ({
        ...prev,
        learn: { name: '', description: '', urgency: 'Medium', desiredProficiency: 'Intermediate' }
      }));
    }
  };

  const removeSkill = (skillId, type) => {
    const field = type === 'offer' ? 'skillsToTeach' : 'skillsToLearn';
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(skill => skill.id !== skillId)
    }));
  };

  const toggleAvailability = (slot) => {
    const current = skillInput.teach.availability;
    const updated = current.includes(slot)
      ? current.filter(s => s !== slot)
      : [...current, slot];
    
    setSkillInput(prev => ({
      ...prev,
      teach: { ...prev.teach, availability: updated }
    }));
  };

  const handleSubmit = async () => {
    try {
      await updateProfile(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Profile setup error:', error);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Tell us about yourself, your interests, and what you're passionate about..."
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Region
          </label>
          <select
            value={formData.region}
            onChange={(e) => handleInputChange('region', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a region</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a timezone</option>
            {timezones.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Learning Goals
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.learningGoals.map((goal, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
            >
              {goal}
              <button
                onClick={() => removeLearningGoal(goal)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a learning goal..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addLearningGoal(e.target.value);
                e.target.value = '';
              }
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              const input = e.target.previousElementSibling;
              addLearningGoal(input.value);
              input.value = '';
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Skills You Can Teach</h3>
        
        {/* Add Skill Form */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="grid gap-4">
            <div>
              <input
                type="text"
                placeholder="Skill name (e.g., React, Python, Guitar)"
                value={skillInput.teach.name}
                onChange={(e) => setSkillInput(prev => ({
                  ...prev,
                  teach: { ...prev.teach, name: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <textarea
                placeholder="Describe your expertise and what you can teach..."
                value={skillInput.teach.description}
                onChange={(e) => setSkillInput(prev => ({
                  ...prev,
                  teach: { ...prev.teach, description: e.target.value }
                }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Proficiency Level
              </label>
              <select
                value={skillInput.teach.proficiency}
                onChange={(e) => setSkillInput(prev => ({
                  ...prev,
                  teach: { ...prev.teach, proficiency: e.target.value }
                }))}
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
                      skillInput.teach.availability.includes(slot)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={addSkillToTeach}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Add Skill to Teach
            </button>
          </div>
        </div>

        {/* Skills List */}
        {formData.skillsToTeach.length > 0 && (
          <div className="space-y-3">
            {formData.skillsToTeach.map(skill => (
              <div key={skill.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                    <p className="text-gray-600 text-sm mt-1">{skill.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {skill.proficiencyLevel}
                      </span>
                      {skill.availability.map(slot => (
                        <span key={slot} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => removeSkill(skill.id, skill.type)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Skills You Want to Learn</h3>
        
        {/* Add Skill Form */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="grid gap-4">
            <div>
              <input
                type="text"
                placeholder="Skill name (e.g., Machine Learning, Photography)"
                value={skillInput.learn.name}
                onChange={(e) => setSkillInput(prev => ({
                  ...prev,
                  learn: { ...prev.learn, name: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <textarea
                placeholder="Describe what you want to learn and your goals..."
                value={skillInput.learn.description}
                onChange={(e) => setSkillInput(prev => ({
                  ...prev,
                  learn: { ...prev.learn, description: e.target.value }
                }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desired Proficiency Level
                </label>
                <select
                  value={skillInput.learn.desiredProficiency}
                  onChange={(e) => setSkillInput(prev => ({
                    ...prev,
                    learn: { ...prev.learn, desiredProficiency: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  value={skillInput.learn.urgency}
                  onChange={(e) => setSkillInput(prev => ({
                    ...prev,
                    learn: { ...prev.learn, urgency: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {urgencyLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={addSkillToLearn}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Add Skill to Learn
            </button>
          </div>
        </div>

        {/* Skills List */}
        {formData.skillsToLearn.length > 0 && (
          <div className="space-y-3">
            {formData.skillsToLearn.map(skill => (
              <div key={skill.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                    <p className="text-gray-600 text-sm mt-1">{skill.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                        Target: {skill.desiredProficiency}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        skill.urgency === 'High' ? 'bg-red-100 text-red-800' :
                        skill.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {skill.urgency} Priority
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeSkill(skill.id, skill.type)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
            <span className="text-sm text-gray-500">Step {currentStep} of 3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Icons */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-8">
            <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                <User className="w-5 h-5" />
              </div>
              <span className="text-sm mt-2">Basic Info</span>
            </div>
            <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}>
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-sm mt-2">Skills to Teach</span>
            </div>
            <div className={`flex flex-col items-center ${currentStep >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}>
                <Target className="w-5 h-5" />
              </div>
              <span className="text-sm mt-2">Skills to Learn</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                Complete Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupPage;
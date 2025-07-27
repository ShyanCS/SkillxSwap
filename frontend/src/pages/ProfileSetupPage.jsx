import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Plus, X, User, MapPin, Clock, BookOpen, Target } from "lucide-react";

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    profilePictureUrl: user?.profilePictureUrl || "",
    bio: user?.bio || "",
    region: user?.region || "",
    timezone: user?.timezone || "",
    skillsToTeach: [],
    skillsToLearn: [],
  });

  // Helper functions
  const isStep2Complete = () => user?.skillsOfferedIds?.length > 0;
  const isStep3Complete = () => user?.skillsRequestedIds?.length > 0;

  const getRequiredSteps = () => {
    const steps = [1]; // Always show basic info
    if (!isStep2Complete()) steps.push(2);
    if (!isStep3Complete()) steps.push(3);
    return steps;
  };

  const requiredSteps = getRequiredSteps();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = requiredSteps[currentStepIndex];
  const totalSteps = requiredSteps.length;

  // Navigation functions
  const goToNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const isLastStep = () => currentStepIndex === totalSteps - 1;

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [skillInput, setSkillInput] = useState({
    teach: {
      name: "",
      description: "",
      proficiency: "Intermediate",
      availability: [],
    },
    learn: {
      name: "",
      description: "",
      urgency: "Medium",
      desiredProficiency: "Intermediate",
    },
  });

  const regions = [
    "North America",
    "South America",
    "Europe",
    "Asia",
    "Africa",
    "Oceania",
  ];

  const timezones = [
    "EST",
    "CST",
    "MST",
    "PST",
    "GMT",
    "CET",
    "JST",
    "AEST",
    "IST",
  ];

  const proficiencyLevels = ["Beginner", "Intermediate", "Advanced"];
  const urgencyLevels = ["Low", "Medium", "High"];
  const availabilityOptions = [
    "Monday AM",
    "Monday PM",
    "Tuesday AM",
    "Tuesday PM",
    "Wednesday AM",
    "Wednesday PM",
    "Thursday AM",
    "Thursday PM",
    "Friday AM",
    "Friday PM",
    "Saturday AM",
    "Saturday PM",
    "Sunday AM",
    "Sunday PM",
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");

    try {
      // 1. Request an upload signature from your backend (GET request)
      const apiRes = await fetch(
        "http://127.0.0.1:5000/api/auth/cloudinary-sign",
        {
          method: "GET",
          credentials: "include", // Important: Include cookies in the request
        }
      );

      if (!apiRes.ok) {
        throw new Error(`Failed to get upload signature: ${apiRes.status}`);
      }

      const signData = await apiRes.json();

      // 2. Prepare form data for Cloudinary
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", signData.apiKey);
      form.append("timestamp", signData.timestamp);
      form.append("signature", signData.signature);
      form.append("folder", signData.folder);

      // 3. Upload to Cloudinary
      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`,
        {
          method: "POST",
          body: form,
        }
      );

      const data = await cloudinaryRes.json();
      if (!data.secure_url) throw new Error("Upload failed");

      // 4. Save URL to the form state
      setFormData((prev) => ({
        ...prev,
        profilePictureUrl: data.secure_url,
      }));
    } catch (err) {
      setUploadError("Could not upload image. Try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const addSkillToTeach = () => {
    const { name, description, proficiency, availability } = skillInput.teach;
    if (name && description && availability.length > 0) {
      const newSkill = {
        id: Date.now().toString(),
        name,
        description,
        type: "offer",
        proficiencyLevel: proficiency,
        availability,
        status: "Active",
      };
      setFormData((prev) => ({
        ...prev,
        skillsToTeach: [...prev.skillsToTeach, newSkill],
      }));
      setSkillInput((prev) => ({
        ...prev,
        teach: {
          name: "",
          description: "",
          proficiency: "Intermediate",
          availability: [],
        },
      }));
    }
  };

  const addSkillToLearn = () => {
    const { name, description, urgency, desiredProficiency } = skillInput.learn;
    if (name && description) {
      const newSkill = {
        name,
        description,
        type: "request",
        urgency,
        desiredProficiency,
        status: "Active",
      };
      setFormData((prev) => ({
        ...prev,
        skillsToLearn: [...prev.skillsToLearn, newSkill],
      }));
      setSkillInput((prev) => ({
        ...prev,
        learn: {
          name: "",
          description: "",
          urgency: "Medium",
          desiredProficiency: "Intermediate",
        },
      }));
    }
  };

  const removeSkill = (skillId, type) => {
    const field = type === "offer" ? "skillsToTeach" : "skillsToLearn";
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((skill) => skill.id !== skillId),
    }));
  };

  const toggleAvailability = (slot) => {
    const current = skillInput.teach.availability;
    const updated = current.includes(slot)
      ? current.filter((s) => s !== slot)
      : [...current, slot];

    setSkillInput((prev) => ({
      ...prev,
      teach: { ...prev.teach, availability: updated },
    }));
  };

  const handleSubmit = async () => {
    try {
      await updateProfile(formData);
      navigate("/dashboard");
    } catch (error) {
      console.error("Profile setup error:", error);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Picture
        </label>
        <div className="flex items-center space-x-4">
          <img
            src={
              formData.profilePictureUrl ||
              "https://ui-avatars.com/api/?name=User"
            }
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleProfileImageChange}
            className="block text-sm text-gray-600"
          />
          {uploading && (
            <span className="text-xs text-blue-600">Uploading...</span>
          )}
        </div>
        {uploadError && (
          <p className="text-xs text-red-500 mt-1">{uploadError}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => handleInputChange("bio", e.target.value)}
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
            onChange={(e) => handleInputChange("region", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a region</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => handleInputChange("timezone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a timezone</option>
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
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
                onChange={(e) =>
                  setSkillInput((prev) => ({
                    ...prev,
                    teach: { ...prev.teach, name: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <textarea
                placeholder="Describe your expertise and what you can teach..."
                value={skillInput.teach.description}
                onChange={(e) =>
                  setSkillInput((prev) => ({
                    ...prev,
                    teach: { ...prev.teach, description: e.target.value },
                  }))
                }
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
                onChange={(e) =>
                  setSkillInput((prev) => ({
                    ...prev,
                    teach: { ...prev.teach, proficiency: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {proficiencyLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {availabilityOptions.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => toggleAvailability(slot)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      skillInput.teach.availability.includes(slot)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
            {formData.skillsToTeach.map((skill) => (
              <div
                key={skill.id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {skill.name}
                    </h4>
                    <p className="text-gray-600 text-sm mt-1">
                      {skill.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {skill.proficiencyLevel}
                      </span>
                      {skill.availability.map((slot) => (
                        <span
                          key={slot}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        >
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
                onChange={(e) =>
                  setSkillInput((prev) => ({
                    ...prev,
                    learn: { ...prev.learn, name: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <textarea
                placeholder="Describe what you want to learn and your goals..."
                value={skillInput.learn.description}
                onChange={(e) =>
                  setSkillInput((prev) => ({
                    ...prev,
                    learn: { ...prev.learn, description: e.target.value },
                  }))
                }
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
                  onChange={(e) =>
                    setSkillInput((prev) => ({
                      ...prev,
                      learn: {
                        ...prev.learn,
                        desiredProficiency: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {proficiencyLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency
                </label>
                <select
                  value={skillInput.learn.urgency}
                  onChange={(e) =>
                    setSkillInput((prev) => ({
                      ...prev,
                      learn: { ...prev.learn, urgency: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {urgencyLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
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
            {formData.skillsToLearn.map((skill) => (
              <div
                key={skill.id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {skill.name}
                    </h4>
                    <p className="text-gray-600 text-sm mt-1">
                      {skill.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                        Target: {skill.desiredProficiency}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          skill.urgency === "High"
                            ? "bg-red-100 text-red-800"
                            : skill.urgency === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
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
            <h1 className="text-2xl font-bold text-gray-900">
              Complete Your Profile
            </h1>
            <span className="text-sm text-gray-500">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Step Icons */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-8">
            {requiredSteps.includes(1) && (
              <div
                className={`flex flex-col items-center ${
                  currentStep >= 1 ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
                >
                  <User className="w-5 h-5" />
                </div>
                <span className="text-sm mt-2">Basic Info</span>
              </div>
            )}

            {requiredSteps.includes(2) && (
              <div
                className={`flex flex-col items-center ${
                  currentStep >= 2 ? "text-green-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 2 ? "bg-green-600 text-white" : "bg-gray-200"
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-sm mt-2">Skills to Teach</span>
              </div>
            )}

            {requiredSteps.includes(3) && (
              <div
                className={`flex flex-col items-center ${
                  currentStep >= 3 ? "text-purple-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 3
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  <Target className="w-5 h-5" />
                </div>
                <span className="text-sm mt-2">Skills to Learn</span>
              </div>
            )}
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
              onClick={goToPreviousStep}
              disabled={currentStepIndex === 0}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {!isLastStep() ? (
              <button
                onClick={goToNextStep}
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

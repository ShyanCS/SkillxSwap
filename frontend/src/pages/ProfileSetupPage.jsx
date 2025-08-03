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
  });

  // Helper functions
  const requiredSteps = [1];
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
      const apiRes = await fetch(
        "http://127.0.0.1:5000/api/auth/cloudinary-sign",
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!apiRes.ok) {
        throw new Error(`Failed to get upload signature: ${apiRes.status}`);
      }

      const signData = await apiRes.json();

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", signData.apiKey);
      form.append("timestamp", signData.timestamp);
      form.append("signature", signData.signature);
      form.append("folder", signData.folder);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`,
        {
          method: "POST",
          body: form,
        }
      );

      const data = await cloudinaryRes.json();
      if (!data.secure_url) throw new Error("Upload failed");

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
            <div
              className={`flex flex-col items-center text-blue-600`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 text-white`}
              >
                <User className="w-5 h-5" />
              </div>
              <span className="text-sm mt-2">Basic Info</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          {renderStep1()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={goToPreviousStep}
              disabled={currentStepIndex === 0}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Complete Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupPage;

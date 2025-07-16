import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Video, 
  MapPin, 
  Plus,
  ArrowLeft,
  ArrowRight,
  Check
} from 'lucide-react';

const ScheduleSessionPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [sessionType, setSessionType] = useState('online');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');

  // Mock data - replace with actual API calls
  const connectedUsers = [
    {
      id: 'user1',
      name: 'Sarah Chen',
      profilePictureUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
      skills: [
        { id: '1', name: 'React Development', type: 'teaching' },
        { id: '2', name: 'JavaScript ES6+', type: 'teaching' }
      ],
      timezone: 'EST',
      availability: {
        '2024-01-20': ['09:00', '10:00', '14:00', '15:00', '16:00'],
        '2024-01-21': ['09:00', '11:00', '14:00', '15:00'],
        '2024-01-22': ['10:00', '11:00', '14:00', '16:00', '17:00'],
        '2024-01-23': ['09:00', '10:00', '11:00', '15:00', '16:00']
      }
    },
    {
      id: 'user2',
      name: 'Miguel Rodriguez',
      profilePictureUrl: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400',
      skills: [
        { id: '3', name: 'Machine Learning', type: 'teaching' },
        { id: '4', name: 'Python Programming', type: 'teaching' }
      ],
      timezone: 'EST',
      availability: {
        '2024-01-20': ['10:00', '11:00', '15:00', '16:00'],
        '2024-01-21': ['09:00', '10:00', '14:00', '17:00'],
        '2024-01-22': ['09:00', '11:00', '15:00', '16:00'],
        '2024-01-23': ['10:00', '14:00', '15:00', '16:00', '17:00']
      }
    },
    {
      id: 'user3',
      name: 'Emma Thompson',
      profilePictureUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400',
      skills: [
        { id: '5', name: 'Product Management', type: 'teaching' },
        { id: '6', name: 'UI/UX Design', type: 'learning' }
      ],
      timezone: 'GMT',
      availability: {
        '2024-01-20': ['13:00', '14:00', '15:00', '16:00'],
        '2024-01-21': ['12:00', '13:00', '15:00', '16:00'],
        '2024-01-22': ['13:00', '14:00', '16:00', '17:00'],
        '2024-01-23': ['12:00', '13:00', '14:00', '15:00']
      }
    }
  ];

  // Generate calendar dates (next 2 weeks)
  const generateCalendarDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const calendarDates = generateCalendarDates();

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAvailableTimeSlots = () => {
    if (!selectedUser || !selectedDate) return [];
    const dateKey = formatDate(selectedDate);
    return selectedUser.availability[dateKey] || [];
  };

  const handleScheduleSession = () => {
    const sessionData = {
      user: selectedUser,
      skill: selectedSkill,
      date: selectedDate,
      time: selectedTime,
      duration,
      type: sessionType,
      location: sessionType === 'in-person' ? location : 'Online',
      notes
    };

    console.log('Scheduling session:', sessionData);
    alert('Session scheduled successfully!');
    navigate('/sessions');
  };

  const canProceed = (currentStep) => {
    switch (currentStep) {
      case 1:
        return selectedUser && selectedSkill;
      case 2:
        return selectedDate && selectedTime;
      case 3:
        return sessionType === 'online' || (sessionType === 'in-person' && location);
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule a Session</h1>
          <p className="text-gray-600">
            Book a learning session with one of your connected partners
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= stepNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > stepNumber ? <Check className="w-5 h-5" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-20 h-1 mx-4 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Select Partner & Skill</span>
            <span>Choose Date & Time</span>
            <span>Session Details</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm">
          {/* Step 1: Select Partner & Skill */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Select Learning Partner & Skill</h2>
              
              <div className="space-y-4 mb-6">
                {connectedUsers.map(user => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedUser?.id === user.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={user.profilePictureUrl}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-500">Timezone: {user.timezone}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {user.skills.map(skill => (
                            <span
                              key={skill.id}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                skill.type === 'teaching'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {skill.name} ({skill.type})
                            </span>
                          ))}
                        </div>
                      </div>
                      {selectedUser?.id === user.id && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedUser && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Select Skill</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedUser.skills.map(skill => (
                      <button
                        key={skill.id}
                        onClick={() => setSelectedSkill(skill)}
                        className={`p-3 text-left border rounded-lg transition-colors ${
                          selectedSkill?.id === skill.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{skill.name}</div>
                        <div className={`text-sm ${
                          skill.type === 'teaching' ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {skill.type === 'teaching' ? 'They teach' : 'You teach'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Choose Date & Time */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Choose Date & Time</h2>
              
              {/* Calendar */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Select Date</h3>
                <div className="grid grid-cols-7 gap-2">
                  {calendarDates.map(date => {
                    const dateKey = formatDate(date);
                    const hasAvailability = selectedUser?.availability[dateKey]?.length > 0;
                    
                    return (
                      <button
                        key={dateKey}
                        onClick={() => hasAvailability && setSelectedDate(date)}
                        disabled={!hasAvailability}
                        className={`p-3 text-center border rounded-lg transition-colors ${
                          selectedDate && formatDate(selectedDate) === dateKey
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : hasAvailability
                            ? 'border-gray-200 hover:border-gray-300 text-gray-900'
                            : 'border-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="text-sm font-medium">
                          {formatDisplayDate(date)}
                        </div>
                        {hasAvailability && (
                          <div className="text-xs mt-1 text-green-600">
                            {selectedUser.availability[dateKey].length} slots
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Available Time Slots</h3>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {getAvailableTimeSlots().map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 text-center border rounded-lg transition-colors ${
                          selectedTime === time
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Session Details */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Session Details</h2>
              
              <div className="space-y-6">
                {/* Session Type */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Session Type</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setSessionType('online')}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        sessionType === 'online'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Video className="w-6 h-6 text-blue-600 mb-2" />
                      <div className="font-medium">Online Session</div>
                      <div className="text-sm text-gray-600">Video call via Zoom/Meet</div>
                    </button>
                    
                    <button
                      onClick={() => setSessionType('in-person')}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        sessionType === 'in-person'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <MapPin className="w-6 h-6 text-blue-600 mb-2" />
                      <div className="font-medium">In-Person Session</div>
                      <div className="text-sm text-gray-600">Meet at a location</div>
                    </button>
                  </div>
                </div>

                {/* Location (if in-person) */}
                {sessionType === 'in-person' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter meeting location..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Add any specific topics you'd like to cover or special requests..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Session Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Session Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Partner:</span>
                      <span className="font-medium">{selectedUser?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Skill:</span>
                      <span className="font-medium">{selectedSkill?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {selectedDate && formatDisplayDate(selectedDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">
                        {duration === 60 ? '1 hour' : `${duration} minutes`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">
                        {sessionType === 'online' ? 'Online' : 'In-Person'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
            
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed(step)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleScheduleSession}
                disabled={!canProceed(step)}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CalendarIcon className="w-4 h-4" />
                Schedule Session
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSessionPage;
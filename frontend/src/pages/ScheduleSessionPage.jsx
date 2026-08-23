import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';
import { useAvailability } from '../contexts/AvailabilityContext';
import { Calendar as CalendarIcon, Video, MapPin, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import useScheduleWizard from '../hooks/useScheduleWizard';

// Index 0 is unused: the API uses ISO day numbering (1 = Monday).
const DAY_NAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const formatMinutes = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours % 24).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const ScheduleSessionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getSchedulableMatches, createSession } = useSession();
  const { getUserAvailability } = useAvailability();

  const wizard = useScheduleWizard({
    getSchedulableMatches,
    getUserAvailability,
    createSession,
    userId: user?.id,
    onSuccess: () => navigate('/sessions'),
  });
  const {
    step,
    matches,
    loadingMatches,
    error,
    selectedMatch,
    selectedSkill,
    partnerAvailability,
    scheduledAt,
    duration,
    sessionType,
    location,
    notes,
    submitting,
    selectMatch,
    selectSkill,
    setScheduledAt,
    setDuration,
    setSessionType,
    setLocation,
    setNotes,
    canProceed,
    goNext,
    goBack,
    submit,
  } = wizard;

  // Minimum selectable datetime = now, formatted for datetime-local input
  const minDateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule a Session</h1>
          <p className="text-gray-600">Book a learning session with one of your connected partners</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step > stepNumber ? <Check className="w-5 h-5" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-20 h-1 mx-4 ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'}`}
                  />
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl p-8 shadow-sm">
          {/* Step 1: Select Partner & Skill */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Select Learning Partner & Skill</h2>

              {loadingMatches ? (
                <p className="text-gray-500">Loading your matches...</p>
              ) : matches.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">You don&apos;t have any accepted matches yet.</p>
                  <p className="text-sm text-gray-400">
                    Accept a match request first, then come back here to schedule a session.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {matches.map((match) => (
                    <button
                      key={match.matchId}
                      type="button"
                      onClick={() => selectMatch(match)}
                      className={`block w-full text-left border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedMatch?.matchId === match.matchId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            match.partner.profilePictureUrl ||
                            'https://ui-avatars.com/api/?name=' +
                              encodeURIComponent(match.partner.name)
                          }
                          alt={match.partner.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{match.partner.name}</h3>
                          <p className="text-sm text-gray-500">Timezone: {match.partner.timezone}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {match.teachableByPartner.map((skill) => (
                              <span
                                key={`p-${skill.skillId}`}
                                className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800"
                              >
                                {skill.name} (they teach)
                              </span>
                            ))}
                            {match.teachableByMe.map((skill) => (
                              <span
                                key={`m-${skill.skillId}`}
                                className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {skill.name} (you teach)
                              </span>
                            ))}
                          </div>
                        </div>
                        {selectedMatch?.matchId === match.matchId && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedMatch && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Select Skill</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedMatch.teachableByPartner.map((skill) => (
                      <button
                        key={`p-${skill.skillId}`}
                        onClick={() => selectSkill({ ...skill, teacherRole: 'partner' })}
                        className={`p-3 text-left border rounded-lg transition-colors ${
                          selectedSkill?.skillId === skill.skillId &&
                          selectedSkill?.teacherRole === 'partner'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{skill.name}</div>
                        <div className="text-sm text-green-600">They teach</div>
                      </button>
                    ))}
                    {selectedMatch.teachableByMe.map((skill) => (
                      <button
                        key={`m-${skill.skillId}`}
                        onClick={() => selectSkill({ ...skill, teacherRole: 'me' })}
                        className={`p-3 text-left border rounded-lg transition-colors ${
                          selectedSkill?.skillId === skill.skillId &&
                          selectedSkill?.teacherRole === 'me'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{skill.name}</div>
                        <div className="text-sm text-blue-600">You teach</div>
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

              {partnerAvailability && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    {selectedMatch?.partner.name}&apos;s usual availability
                  </h3>
                  {partnerAvailability.slots.length === 0 ? (
                    <p className="text-sm text-blue-800">
                      They haven&apos;t set availability, so any time is worth proposing.
                    </p>
                  ) : (
                    <>
                      <ul className="text-sm text-blue-800 space-y-1">
                        {partnerAvailability.slots.map((slot, i) => (
                          <li key={i}>
                            {DAY_NAMES[slot.dayOfWeek]} {formatMinutes(slot.startMinute)} &ndash;{' '}
                            {formatMinutes(slot.endMinute)}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-blue-700 mt-2">
                        Shown in their timezone ({partnerAvailability.timezone}). Pick the time in
                        yours below &mdash; the two are matched on the actual moment, not the clock
                        reading.
                      </p>
                    </>
                  )}
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="session-datetime" className="block text-sm font-medium text-gray-700 mb-2">
                  Session Date & Time
                </label>
                <input
                  id="session-datetime"
                  type="datetime-local"
                  value={scheduledAt}
                  min={minDateTime}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="session-duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <select
                  id="session-duration"
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

                <div>
                  <label htmlFor="session-location" className="block text-sm font-medium text-gray-700 mb-2">
                    {sessionType === 'in-person' ? 'Meeting Location' : 'Meeting Link (optional)'}
                  </label>
                  <input
                    id="session-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={
                      sessionType === 'in-person' ? 'Enter meeting location...' : 'e.g. Zoom/Meet link'
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="session-notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Session Notes (Optional)
                  </label>
                  <textarea
                    id="session-notes"
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
                      <span className="font-medium">{selectedMatch?.partner.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Skill:</span>
                      <span className="font-medium">{selectedSkill?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Teacher:</span>
                      <span className="font-medium">
                        {selectedSkill?.teacherRole === 'me' ? 'You' : selectedMatch?.partner.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date & Time:</span>
                      <span className="font-medium">
                        {scheduledAt && new Date(scheduledAt).toLocaleString()}
                      </span>
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
              onClick={goBack}
              disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {step < 3 ? (
              <button
                onClick={goNext}
                disabled={!canProceed(step)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={!canProceed(step) || submitting}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CalendarIcon className="w-4 h-4" />
                {submitting ? 'Scheduling...' : 'Schedule Session'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSessionPage;

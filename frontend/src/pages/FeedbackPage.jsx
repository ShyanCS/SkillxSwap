import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Star, 
  User, 
  Clock, 
  Calendar,
  Send,
  CheckCircle,
  MessageSquare
} from 'lucide-react';

const FeedbackPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedSession, setSelectedSession] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for sessions that need feedback - replace with actual API call
  const [completedSessions, setCompletedSessions] = useState([
    {
      id: '1',
      partner: {
        id: 'user1',
        name: 'Sarah Chen',
        profilePictureUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.9
      },
      skill: {
        name: 'React Development',
        description: 'Advanced React patterns and hooks'
      },
      role: 'learner', // 'learner' or 'teacher'
      startTime: '2024-01-18T15:00:00Z',
      endTime: '2024-01-18T16:00:00Z',
      duration: 60,
      type: 'online',
      location: 'Zoom Meeting',
      notes: 'Covered useEffect optimization and custom hooks',
      completedAt: '2024-01-18T16:00:00Z',
      feedbackGiven: false
    },
    {
      id: '2',
      partner: {
        id: 'user2',
        name: 'Miguel Rodriguez',
        profilePictureUrl: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.7
      },
      skill: {
        name: 'Machine Learning',
        description: 'Python ML fundamentals and scikit-learn'
      },
      role: 'learner',
      startTime: '2024-01-17T14:00:00Z',
      endTime: '2024-01-17T15:30:00Z',
      duration: 90,
      type: 'online',
      location: 'Google Meet',
      notes: 'Introduction to supervised learning algorithms',
      completedAt: '2024-01-17T15:30:00Z',
      feedbackGiven: false
    },
    {
      id: '3',
      partner: {
        id: 'user3',
        name: 'Alex Johnson',
        profilePictureUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.8
      },
      skill: {
        name: 'Python Programming',
        description: 'Advanced Python concepts and best practices'
      },
      role: 'teacher',
      startTime: '2024-01-16T16:00:00Z',
      endTime: '2024-01-16T17:00:00Z',
      duration: 60,
      type: 'online',
      location: 'Zoom Meeting',
      notes: 'Taught decorators and context managers',
      completedAt: '2024-01-16T17:00:00Z',
      feedbackGiven: false
    }
  ]);

  // Mock data for feedback history
  const [feedbackHistory, setFeedbackHistory] = useState([
    {
      id: '1',
      session: {
        partner: {
          name: 'Emma Thompson',
          profilePictureUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400'
        },
        skill: { name: 'UI/UX Design' },
        role: 'teacher'
      },
      rating: 5,
      comment: 'Excellent session! Very clear explanations and practical examples.',
      givenAt: '2024-01-15T18:00:00Z'
    },
    {
      id: '2',
      session: {
        partner: {
          name: 'David Kim',
          profilePictureUrl: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400'
        },
        skill: { name: 'JavaScript ES6+' },
        role: 'learner'
      },
      rating: 4,
      comment: 'Good session, learned a lot about arrow functions and promises.',
      givenAt: '2024-01-14T19:30:00Z'
    }
  ]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmitFeedback = async () => {
    if (!selectedSession || rating === 0) {
      alert('Please select a session and provide a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call - replace with actual feedback submission
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the session to mark feedback as given
      setCompletedSessions(prev =>
        prev.map(session =>
          session.id === selectedSession.id
            ? { ...session, feedbackGiven: true }
            : session
        )
      );

      // Add to feedback history
      const newFeedback = {
        id: Date.now().toString(),
        session: {
          partner: selectedSession.partner,
          skill: selectedSession.skill,
          role: selectedSession.role
        },
        rating,
        comment,
        givenAt: new Date().toISOString()
      };

      setFeedbackHistory(prev => [newFeedback, ...prev]);

      // Reset form
      setSelectedSession(null);
      setRating(0);
      setComment('');

      alert('Feedback submitted successfully!');
    } catch (error) {
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, readonly = false }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            className={`text-2xl transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} ${
              star <= (readonly ? value : (hoverRating || rating))
                ? 'text-yellow-500'
                : 'text-gray-300'
            }`}
          >
            <Star className={`w-8 h-8 ${
              star <= (readonly ? value : (hoverRating || rating)) ? 'fill-current' : ''
            }`} />
          </button>
        ))}
      </div>
    );
  };

  const SessionCard = ({ session, onSelect, isSelected }) => (
    <div
      onClick={() => onSelect(session)}
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <img
          src={session.partner.profilePictureUrl}
          alt={session.partner.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{session.partner.name}</h3>
          <div className="text-sm text-gray-500">
            <span className={`${
              session.role === 'teacher' ? 'text-green-600' : 'text-blue-600'
            }`}>
              You were the {session.role}
            </span>
          </div>
        </div>
        {isSelected && <CheckCircle className="w-5 h-5 text-blue-600" />}
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <h4 className="font-medium text-gray-900 mb-1">{session.skill.name}</h4>
        <p className="text-sm text-gray-600 mb-2">{session.skill.description}</p>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(session.startTime)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
          </div>
        </div>
      </div>

      {session.notes && (
        <p className="text-sm text-gray-600 italic">"{session.notes}"</p>
      )}
    </div>
  );

  const pendingSessions = completedSessions.filter(session => !session.feedbackGiven);

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Feedback</h1>
          <p className="text-gray-600">
            Provide feedback for your completed sessions to help build the community
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Feedback</p>
                <p className="text-2xl font-bold text-gray-900">{pendingSessions.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-sm text-yellow-600 mt-2">Sessions awaiting feedback</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Feedback Given</p>
                <p className="text-2xl font-bold text-gray-900">{feedbackHistory.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-green-600 mt-2">Total feedback provided</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating Given</p>
                <p className="text-2xl font-bold text-gray-900">
                  {feedbackHistory.length > 0 
                    ? (feedbackHistory.reduce((sum, f) => sum + f.rating, 0) / feedbackHistory.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-sm text-blue-600 mt-2">Stars per session</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Give Feedback Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Give Feedback</h2>

            {pendingSessions.length > 0 ? (
              <>
                {/* Session Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Select a Session</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {pendingSessions.map(session => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onSelect={setSelectedSession}
                        isSelected={selectedSession?.id === session.id}
                      />
                    ))}
                  </div>
                </div>

                {/* Feedback Form */}
                {selectedSession && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">
                      Rate your experience with {selectedSession.partner.name}
                    </h3>

                    {/* Star Rating */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        How would you rate this session?
                      </label>
                      <StarRating value={rating} onChange={setRating} />
                      <p className="text-sm text-gray-500 mt-2">
                        {rating === 0 && 'Click to rate'}
                        {rating === 1 && 'Poor - Not helpful'}
                        {rating === 2 && 'Fair - Somewhat helpful'}
                        {rating === 3 && 'Good - Helpful'}
                        {rating === 4 && 'Very Good - Very helpful'}
                        {rating === 5 && 'Excellent - Extremely helpful'}
                      </p>
                    </div>

                    {/* Comment */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment (Optional)
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Share your experience, what you learned, or how the session could be improved..."
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={rating === 0 || isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Feedback
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  All caught up!
                </h3>
                <p className="text-gray-500">
                  You've provided feedback for all your completed sessions.
                </p>
              </div>
            )}
          </div>

          {/* Feedback History */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Feedback History</h2>

            {feedbackHistory.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {feedbackHistory.map(feedback => (
                  <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={feedback.session.partner.profilePictureUrl}
                        alt={feedback.session.partner.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {feedback.session.partner.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {feedback.session.skill.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <StarRating value={feedback.rating} readonly />
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(feedback.givenAt)}
                        </p>
                      </div>
                    </div>

                    {feedback.comment && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        "{feedback.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No feedback given yet
                </h3>
                <p className="text-gray-500">
                  Your feedback history will appear here after you complete sessions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
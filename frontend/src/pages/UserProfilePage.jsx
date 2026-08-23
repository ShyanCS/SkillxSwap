import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMatch } from '../contexts/MatchContext';
import { API_BASE_URL } from '../config/api';
import {
  Star,
  MapPin,
  Clock,
  BookOpen,
  Target,
  Calendar,
  MessageCircle,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';

const UserProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { sendMatchRequest, hasAlreadyRequested } = useMatch();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [alreadyRequested, setAlreadyRequested] = useState(false);
  const [sending, setSending] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const isOwnProfile = String(currentUser?.id) === String(userId);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not load this profile');
        setProfile(data);

        if (!isOwnProfile) {
          setAlreadyRequested(await hasAlreadyRequested(userId));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handleSendRequest = async () => {
    setSending(true);
    setActionMessage('');
    try {
      // Offer every skill of mine this person wants, and ask for every skill
      // of theirs I want -- the same reciprocal basis the matching page uses.
      const theirOfferedIds = profile.skillsOffered.map((s) => s.id);
      const mySkillsRes = await fetch(`${API_BASE_URL}/api/skills/get?type=offer`, {
        credentials: 'include',
      });
      const myOffered = await mySkillsRes.json();

      if (!theirOfferedIds.length || !myOffered.length) {
        setActionMessage('You both need at least one offered skill before connecting.');
        return;
      }

      await sendMatchRequest(
        Number(userId),
        theirOfferedIds,
        myOffered.map((s) => s.id),
      );
      setAlreadyRequested(true);
      setActionMessage('Match request sent.');
    } catch (err) {
      setActionMessage(err.message || 'Could not send the request.');
    } finally {
      setSending(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reportedUserId: Number(userId), reason: reportReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit the report');
      setReporting(false);
      setReportReason('');
      setActionMessage('Report submitted. Our admins will review it.');
    } catch (err) {
      setActionMessage(err.message);
    }
  };

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 text-center text-gray-500">
        Loading profile…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/matching" className="text-blue-600 hover:text-blue-700 font-medium">
          ← Back to matching
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/matching"
          className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <img
              src={
                profile.profilePictureUrl ||
                `https://ui-avatars.com/api/?size=160&name=${encodeURIComponent(profile.name)}`
              }
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                {profile.ratingCount > 0 && (
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    {profile.rating.toFixed(1)} ({profile.ratingCount})
                  </span>
                )}
              </div>
              {profile.bio && <p className="text-gray-600 mb-3">{profile.bio}</p>}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {profile.region && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.region}
                  </span>
                )}
                {profile.timezone && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {profile.timezone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {profile.completedSessions} session{profile.completedSessions === 1 ? '' : 's'}{' '}
                  completed
                </span>
                <span>Member since {formatDate(profile.joinedAt)}</span>
              </div>
            </div>

            {!isOwnProfile && (
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <button
                  onClick={handleSendRequest}
                  disabled={alreadyRequested || sending}
                  className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                    alreadyRequested
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {alreadyRequested ? 'Request Sent' : sending ? 'Sending…' : 'Send Match Request'}
                </button>
                <Link
                  to="/messages"
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-center flex items-center justify-center gap-1"
                >
                  <MessageCircle className="w-4 h-4" /> Message
                </Link>
                <button
                  onClick={() => setReporting((v) => !v)}
                  className="text-xs text-gray-500 hover:text-red-600 flex items-center justify-center gap-1"
                >
                  <ShieldAlert className="w-3 h-3" /> Report user
                </button>
              </div>
            )}
          </div>

          {actionMessage && (
            <p className="mt-4 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              {actionMessage}
            </p>
          )}

          {reporting && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why are you reporting {profile.name}?
              </label>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what happened…"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleReport}
                  disabled={!reportReason.trim()}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg text-sm"
                >
                  Submit report
                </button>
                <button
                  onClick={() => {
                    setReporting(false);
                    setReportReason('');
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Teaches */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <BookOpen className="w-5 h-5 text-green-600" /> Can teach
            </h2>
            {profile.skillsOffered.length > 0 ? (
              <div className="space-y-3">
                {profile.skillsOffered.map((skill) => (
                  <div key={skill.id} className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900">{skill.name}</h3>
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                        {skill.proficiencyLevel}
                      </span>
                    </div>
                    {skill.description && (
                      <p className="text-sm text-gray-600">{skill.description}</p>
                    )}
                    {skill.availability?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {skill.availability.map((slot) => (
                          <span
                            key={slot}
                            className="bg-white text-gray-600 px-2 py-0.5 rounded text-xs border"
                          >
                            {slot}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No skills offered yet.</p>
            )}
          </div>

          {/* Wants to learn */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Target className="w-5 h-5 text-purple-600" /> Wants to learn
            </h2>
            {profile.skillsRequested.length > 0 ? (
              <div className="space-y-3">
                {profile.skillsRequested.map((skill) => (
                  <div key={skill.id} className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900">{skill.name}</h3>
                      <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs font-medium">
                        Target: {skill.desiredProficiency}
                      </span>
                    </div>
                    {skill.description && (
                      <p className="text-sm text-gray-600">{skill.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No learning goals listed yet.</p>
            )}
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Feedback</h2>
          {profile.recentFeedback.length > 0 ? (
            <div className="space-y-4">
              {profile.recentFeedback.map((review) => (
                <div key={review.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{review.reviewerName}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{review.skillName}</p>
                  {review.comment && <p className="text-sm text-gray-700">"{review.comment}"</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No feedback yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;

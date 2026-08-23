import { useEffect, useState } from 'react';

/**
 * State machine for the three-step session scheduling wizard.
 *
 * Step 1 picks a match and a skill (and who teaches it), step 2 picks a
 * time, step 3 collects session details and submits. Data access is
 * injected as plain functions so this hook can be exercised without any
 * network or provider mocking.
 *
 * While a match is selected, the partner's weekly availability is fetched
 * and surfaced to the UI -- proposing times blind only to hit a server
 * rejection is worse than showing the windows up front.
 */
export function useScheduleWizard({
  getSchedulableMatches,
  getUserAvailability,
  createSession,
  userId,
  onSuccess,
}) {
  const [step, setStep] = useState(1);
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [error, setError] = useState('');
  const [partnerAvailability, setPartnerAvailability] = useState(null);

  const [selectedMatch, setSelectedMatch] = useState(null);
  // { skillId, name, ..., teacherRole: 'me' | 'partner' }
  const [selectedSkill, setSelectedSkill] = useState(null);

  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(60);
  const [sessionType, setSessionType] = useState('online');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSchedulableMatches()
      .then((data) => {
        if (!cancelled) setMatches(data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load your matches.');
      })
      .finally(() => {
        if (!cancelled) setLoadingMatches(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per mount
  }, []);

  useEffect(() => {
    if (!selectedMatch) {
      setPartnerAvailability(null);
      return;
    }
    let cancelled = false;
    getUserAvailability(selectedMatch.partner.id)
      .then((a) => {
        if (!cancelled) setPartnerAvailability(a);
      })
      .catch(() => {
        if (!cancelled) setPartnerAvailability(null);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch per selected match
  }, [selectedMatch]);

  const selectMatch = (match) => {
    setSelectedMatch(match);
    setSelectedSkill(null);
  };

  const selectSkill = (skill) => setSelectedSkill({ ...skill, teacherRole: skill.teacherRole });

  const canProceed = (currentStep) => {
    switch (currentStep) {
      case 1:
        return Boolean(selectedMatch && selectedSkill);
      case 2:
        return Boolean(scheduledAt);
      case 3:
        return sessionType === 'online' || (sessionType === 'in-person' && !!location);
      default:
        return false;
    }
  };

  const goNext = () => setStep((s) => Math.min(3, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    if (!selectedMatch || !selectedSkill) return;
    setSubmitting(true);
    setError('');
    try {
      const teacherId = selectedSkill.teacherRole === 'me' ? userId : selectedMatch.partner.id;
      await createSession({
        matchId: selectedMatch.matchId,
        skillId: selectedSkill.skillId,
        teacherId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes: duration,
        sessionType,
        location: sessionType === 'in-person' ? location : location || 'Online',
        notes,
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to schedule session');
    } finally {
      setSubmitting(false);
    }
  };

  return {
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
  };
}

export default useScheduleWizard;

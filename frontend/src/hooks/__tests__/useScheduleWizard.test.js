import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useScheduleWizard } from '../useScheduleWizard';

function makeMatch(overrides = {}) {
  return {
    matchId: 1,
    partner: { id: 7, name: 'Ada' },
    teachableByPartner: [{ skillId: 101, name: 'Guitar' }],
    teachableByMe: [{ skillId: 201, name: 'Python' }],
    ...overrides,
  };
}

const deps = (overrides = {}) => ({
  getSchedulableMatches: vi.fn().mockResolvedValue([]),
  getUserAvailability: vi.fn().mockResolvedValue({ slots: [], timezone: 'UTC' }),
  createSession: vi.fn().mockResolvedValue(undefined),
  userId: 42,
  onSuccess: vi.fn(),
  ...overrides,
});

describe('useScheduleWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts on step 1 and loads the schedulable matches', async () => {
    const d = deps({ getSchedulableMatches: vi.fn().mockResolvedValue([makeMatch()]) });

    const { result } = renderHook(() => useScheduleWizard(d));

    expect(result.current.step).toBe(1);
    expect(result.current.loadingMatches).toBe(true);
    await waitFor(() => expect(result.current.matches).toHaveLength(1));
    expect(result.current.loadingMatches).toBe(false);
  });

  it('survives a failed matches load with an error message', async () => {
    const d = deps({ getSchedulableMatches: vi.fn().mockRejectedValue(new Error('down')) });

    const { result } = renderHook(() => useScheduleWizard(d));

    await waitFor(() => expect(result.current.loadingMatches).toBe(false));
    expect(result.current.error).toBe('Failed to load your matches.');
  });

  it('selecting a match resets the chosen skill and fetches partner availability', async () => {
    const getUserAvailability = vi.fn().mockResolvedValue({
      slots: [{ dayOfWeek: 1, startMinute: 600, endMinute: 720 }],
      timezone: 'Asia/Kolkata',
    });
    const d = deps({ getUserAvailability });
    const { result } = renderHook(() => useScheduleWizard(d));

    act(() => {
      result.current.selectSkill({ skillId: 201, teacherRole: 'me' });
    });
    act(() => {
      result.current.selectMatch(makeMatch());
    });

    // The skill picked against the previous partner must not leak over.
    expect(result.current.selectedSkill).toBeNull();
    await waitFor(() => expect(result.current.partnerAvailability.timezone).toBe('Asia/Kolkata'));
    expect(getUserAvailability).toHaveBeenCalledWith(7);
  });

  it('gates each step on its own requirements', async () => {
    const d = deps();
    const { result } = renderHook(() => useScheduleWizard(d));

    // Step 1 needs both a match and a skill.
    expect(result.current.canProceed(1)).toBe(false);
    act(() => result.current.selectMatch(makeMatch()));
    expect(result.current.canProceed(1)).toBe(false);
    act(() => result.current.selectSkill({ skillId: 101, teacherRole: 'partner' }));
    expect(result.current.canProceed(1)).toBe(true);

    // Step 2 needs a time; step 3 needs a location for in-person only.
    expect(result.current.canProceed(2)).toBe(false);
    act(() => result.current.setScheduledAt('2026-09-01T10:00'));
    expect(result.current.canProceed(2)).toBe(true);

    act(() => result.current.setSessionType('in-person'));
    expect(result.current.canProceed(3)).toBe(false);
    act(() => result.current.setLocation('Community center'));
    expect(result.current.canProceed(3)).toBe(true);

    act(() => result.current.setSessionType('online'));
    expect(result.current.canProceed(3)).toBe(true);
  });

  it('moves between steps without leaving the bounds', async () => {
    const d = deps();
    const { result } = renderHook(() => useScheduleWizard(d));

    act(() => result.current.goBack());
    expect(result.current.step).toBe(1);

    act(() => result.current.goNext());
    act(() => result.current.goNext());
    act(() => result.current.goNext());
    expect(result.current.step).toBe(3);
  });

  it('submits with the selected user as teacher and reports success', async () => {
    const onSuccess = vi.fn();
    const createSession = vi.fn().mockResolvedValue(undefined);
    const d = deps({ onSuccess, createSession });
    const { result } = renderHook(() => useScheduleWizard(d));

    act(() => result.current.selectMatch(makeMatch()));
    act(() => result.current.selectSkill({ skillId: 201, teacherRole: 'me' }));
    act(() => result.current.setScheduledAt('2026-09-01T10:00'));

    await act(async () => {
      await result.current.submit();
    });

    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({ skillId: 201, teacherId: 42, durationMinutes: 60 }),
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("uses the partner as teacher when they're teaching", async () => {
    const createSession = vi.fn().mockResolvedValue(undefined);
    const d = deps({ createSession });
    const { result } = renderHook(() => useScheduleWizard(d));

    act(() => result.current.selectMatch(makeMatch()));
    act(() => result.current.selectSkill({ skillId: 101, teacherRole: 'partner' }));
    act(() => result.current.setScheduledAt('2026-09-01T10:00'));

    await act(async () => {
      await result.current.submit();
    });

    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({ skillId: 101, teacherId: 7 }),
    );
  });

  it('keeps the wizard open with the error when creation fails', async () => {
    const createSession = vi.fn().mockRejectedValue(new Error('Slot already booked'));
    const onSuccess = vi.fn();
    const d = deps({ createSession, onSuccess });
    const { result } = renderHook(() => useScheduleWizard(d));

    act(() => result.current.selectMatch(makeMatch()));
    act(() => result.current.selectSkill({ skillId: 101, teacherRole: 'partner' }));
    act(() => result.current.setScheduledAt('2026-09-01T10:00'));

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.error).toBe('Slot already booked');
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.submitting).toBe(false);
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScheduleSessionPage from '../ScheduleSessionPage';

const { getSchedulableMatches, createSession, getUserAvailability, navigate, user } = vi.hoisted(
  () => ({
    getSchedulableMatches: vi.fn(),
    createSession: vi.fn(),
    getUserAvailability: vi.fn(),
    navigate: vi.fn(),
    user: { id: 42, name: 'Me' },
  }),
);

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user }),
}));

vi.mock('../../contexts/SessionContext', () => ({
  useSession: () => ({ getSchedulableMatches, createSession }),
}));

vi.mock('../../contexts/AvailabilityContext', () => ({
  useAvailability: () => ({ getUserAvailability }),
}));

function makeMatch(overrides = {}) {
  return {
    matchId: 1,
    partner: { id: 7, name: 'Ada', timezone: 'UTC' },
    teachableByPartner: [{ skillId: 101, name: 'Guitar' }],
    teachableByMe: [{ skillId: 201, name: 'Python' }],
    ...overrides,
  };
}

// userEvent cannot type into datetime-local inputs reliably across jsdom
// versions; fireEvent.change mirrors what the browser control does while
// still routing through React's tracked value setter.
const setDateTime = (value) =>
  fireEvent.change(screen.getByLabelText('Session Date & Time'), {
    target: { value },
  });

describe('ScheduleSessionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSchedulableMatches.mockResolvedValue([]);
    getUserAvailability.mockResolvedValue({
      slots: [{ dayOfWeek: 1, startMinute: 600, endMinute: 720 }],
      timezone: 'Asia/Kolkata',
    });
    createSession.mockResolvedValue(undefined);
  });

  it('walks the full wizard and submits with the current user as teacher', async () => {
    const u = userEvent.setup();
    getSchedulableMatches.mockResolvedValue([makeMatch()]);

    render(<ScheduleSessionPage />);

    // Step 1: pick the match, then a skill I teach.
    await u.click(await screen.findByText('Ada'));


    await u.click(screen.getByRole('button', { name: /Python You teach/i }));
    await u.click(screen.getByRole('button', { name: /^Next$/ }));

    // Step 2: the partner's weekly windows are shown here before proposing a time.
    expect(await screen.findByText("Ada's usual availability")).toBeInTheDocument();
    expect(screen.getByText(/Monday 10:00/)).toBeInTheDocument();
    // propose a time.
    setDateTime('2026-09-01T10:00');
    await u.click(screen.getByRole('button', { name: /^Next$/ }));

    // Step 3: the summary names the right teacher, then schedule.
    expect(await screen.findByText('You')).toBeInTheDocument();
    await u.click(screen.getByRole('button', { name: /schedule session/i }));

    await waitFor(() =>
      expect(createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          matchId: 1,
          skillId: 201,
          teacherId: 42,
          sessionType: 'online',
          durationMinutes: 60,
        }),
      ),
    );
    expect(navigate).toHaveBeenCalledWith('/sessions');
  });

  it('keeps the wizard open with an inline error when creation fails', async () => {
    const u = userEvent.setup();
    getSchedulableMatches.mockResolvedValue([makeMatch()]);
    createSession.mockRejectedValue(new Error('Slot already booked'));

    render(<ScheduleSessionPage />);

    await u.click(await screen.findByText('Ada'));
    await u.click(await screen.findByRole('button', { name: /Python You teach/i }));
    await u.click(screen.getByRole('button', { name: /^Next$/ }));
    setDateTime('2026-09-01T10:00');
    await u.click(screen.getByRole('button', { name: /^Next$/ }));
    await u.click(screen.getByRole('button', { name: /schedule session/i }));

    expect(await screen.findByText('Slot already booked')).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
    // The submit button re-enables once submission settles.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /schedule session/i })).toBeEnabled(),
    );
  });

  it('explains itself when there are no accepted matches yet', async () => {
    render(<ScheduleSessionPage />);

    expect(
      await screen.findByText(/don't have any accepted matches yet/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Next$/ })).toBeDisabled();
  });
});

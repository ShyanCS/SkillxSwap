import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SessionsPage from '../SessionsPage';

const { getSessions, cancelSession, completeSession } = vi.hoisted(() => ({
  getSessions: vi.fn(),
  cancelSession: vi.fn(),
  completeSession: vi.fn(),
}));

vi.mock('../../contexts/SessionContext', () => ({
  useSession: () => ({ getSessions, cancelSession, completeSession }),
}));

const partner = {
  id: 7,
  name: 'Ada Teacher',
  rating: 4.5,
  profilePictureUrl: '',
};

function makeSession(overrides = {}) {
  return {
    id: 1,
    status: 'scheduled',
    role: 'teacher',
    type: 'online',
    // Tomorrow: upcoming, so only Cancel applies.
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    location: 'https://meet.example.com/guitar',
    notes: null,
    partner,
    skill: { name: 'Guitar Basics' },
    ...overrides,
  };
}

const renderPage = () =>
  render(
    <MemoryRouter>
      <SessionsPage />
    </MemoryRouter>,
  );

describe('SessionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSessions.mockResolvedValue([]);
  });

  it('renders fetched sessions with their partner and skill', async () => {
    getSessions.mockResolvedValue([makeSession()]);

    renderPage();

    expect(await screen.findByText('Ada Teacher')).toBeInTheDocument();
    expect(screen.getByText('Guitar Basics')).toBeInTheDocument();
    // The upcoming tab reflects the one scheduled session.
    expect(screen.getByRole('button', { name: /upcoming \(1\)/i })).toBeInTheDocument();
    expect(cancelSession).not.toHaveBeenCalled();
    expect(completeSession).not.toHaveBeenCalled();
  });

  it('cancels an upcoming session and refreshes the list', async () => {
    const user = userEvent.setup();
    getSessions.mockResolvedValue([makeSession()]);
    cancelSession.mockResolvedValue(undefined);

    renderPage();

    // Exact name: /cancel/i would also match the "Cancelled (n)" tab.
    await user.click(await screen.findByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(cancelSession).toHaveBeenCalledWith(1));
    // Initial load plus the post-cancel refresh.
    await waitFor(() => expect(getSessions).toHaveBeenCalledTimes(2));
    expect(completeSession).not.toHaveBeenCalled();
  });

  it('offers completion for a scheduled session whose time has passed', async () => {
    const user = userEvent.setup();
    const pastSession = makeSession({
      id: 2,
      startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    });
    getSessions.mockResolvedValue([pastSession]);
    completeSession.mockResolvedValue(undefined);

    renderPage();

    await user.click(await screen.findByRole('button', { name: /mark completed/i }));

    await waitFor(() => expect(completeSession).toHaveBeenCalledWith(2));
    expect(cancelSession).not.toHaveBeenCalled();
  });

  it('shows the empty state when there are no sessions', async () => {
    renderPage();

    expect(
      await screen.findByText(/you don't have any upcoming sessions scheduled/i),
    ).toBeInTheDocument();
    // Exact match: the "Cancelled (0)" tab also contains the word cancel.
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });
});

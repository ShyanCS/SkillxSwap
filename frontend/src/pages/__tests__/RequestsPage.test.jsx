import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RequestsPage from '../RequestsPage';

const { getSentRequest, getRecievedRequest, respondToRequest } = vi.hoisted(() => ({
  getSentRequest: vi.fn(),
  getRecievedRequest: vi.fn(),
  respondToRequest: vi.fn(),
}));

vi.mock('../../contexts/MatchContext', () => ({
  useMatch: () => ({ getSentRequest, getRecievedRequest, respondToRequest }),
}));

const sender = {
  id: 5,
  name: 'Ravi Sender',
  rating: 4.2,
  profilePictureUrl: '',
  sessionsCompleted: 3,
};

function makeReceivedRequest(overrides = {}) {
  return {
    id: 11,
    status: 'pending',
    sentAt: '2026-08-01T10:00:00Z',
    sender,
    skillWanted: [{ name: 'Python', desiredProficiency: 'Beginner' }],
    skillOffered: [{ name: 'Chess', proficiencyLevel: 'Advanced' }],
    ...overrides,
  };
}

function makeSentRequest(overrides = {}) {
  return {
    id: 12,
    status: 'pending',
    sentAt: '2026-08-02T09:00:00Z',
    recipient: { ...sender, name: 'Paula Recipient' },
    skillWanted: [{ name: 'Sketching', desiredProficiency: 'Beginner' }],
    skillOffered: [{ name: 'Docker', proficiencyLevel: 'Expert' }],
    ...overrides,
  };
}

const renderPage = () =>
  render(
    <MemoryRouter>
      <RequestsPage />
    </MemoryRouter>,
  );

describe('RequestsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSentRequest.mockResolvedValue([]);
    getRecievedRequest.mockResolvedValue([]);
  });

  it('renders received requests with the skills being exchanged', async () => {
    getRecievedRequest.mockResolvedValue([makeReceivedRequest()]);

    renderPage();

    expect(await screen.findByText('Ravi Sender')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('Chess')).toBeInTheDocument();
    // A pending received request offers both actions.
    expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
  });

  it('accepting a request calls the API and moves the card to the accepted state', async () => {
    const user = userEvent.setup();
    getRecievedRequest.mockResolvedValue([makeReceivedRequest()]);
    respondToRequest.mockResolvedValue(undefined);

    renderPage();

    await user.click(await screen.findByRole('button', { name: /accept/i }));

    await waitFor(() => expect(respondToRequest).toHaveBeenCalledWith(11, 'Accepted'));
    // The card re-renders as accepted: action buttons give way to follow-ups.
    // Exact text so the "Accepted Requests" stats label doesn't collide.
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /accept/i })).not.toBeInTheDocument(),
    );
    expect(screen.getByText('Accepted')).toBeInTheDocument();
  });

  it('rejecting a request calls the API and updates the card without a reload', async () => {
    const user = userEvent.setup();
    getRecievedRequest.mockResolvedValue([makeReceivedRequest()]);
    respondToRequest.mockResolvedValue(undefined);

    renderPage();

    await user.click(await screen.findByRole('button', { name: /reject/i }));

    await waitFor(() => expect(respondToRequest).toHaveBeenCalledWith(11, 'Rejected'));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /reject/i })).not.toBeInTheDocument(),
    );
    // The list itself was not refetched; only the affected row changed.
    expect(getRecievedRequest).toHaveBeenCalledTimes(1);
  });

  it('shows sent requests on the sent tab with no accept/reject controls', async () => {
    const user = userEvent.setup();
    getSentRequest.mockResolvedValue([makeSentRequest()]);

    renderPage();

    await user.click(await screen.findByRole('button', { name: /sent requests/i }));

    expect(await screen.findByText('Paula Recipient')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /accept/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reject/i })).not.toBeInTheDocument();
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import MatchingPage from '../MatchingPage';

const { getMatches, sendMatchRequest, hasAlreadyRequested } = vi.hoisted(() => ({
  getMatches: vi.fn(),
  sendMatchRequest: vi.fn(),
  hasAlreadyRequested: vi.fn(),
}));

vi.mock('../../contexts/MatchContext', () => ({
  useMatch: () => ({ getMatches, sendMatchRequest, hasAlreadyRequested }),
}));

function makeMatch(overrides = {}) {
  return {
    id: 1,
    compatibilityScore: 85,
    user: { id: 7, name: 'Ada Partner' },
    skillsOffered: [{ id: 101, userSkillId: 201, name: 'Guitar' }],
    skillsRequested: [{ id: 102, userSkillId: 202, name: 'Python' }],
    mutualInterests: ['Hiking'],
    ...overrides,
  };
}

const renderPage = () =>
  render(
    <MemoryRouter>
      <MatchingPage />
    </MemoryRouter>,
  );

describe('MatchingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMatches.mockResolvedValue([]);
    hasAlreadyRequested.mockResolvedValue(false);
  });

  it('renders fetched matches with partner and compatibility score', async () => {
    getMatches.mockResolvedValue([
      makeMatch(),
      makeMatch({ id: 2, compatibilityScore: 70, user: { id: 8, name: 'Grace Second' } }),
    ]);

    renderPage();

    expect(await screen.findByText('Ada Partner')).toBeInTheDocument();
    expect(screen.getByText('85% Match')).toBeInTheDocument();
    expect(screen.getByText('70% Match')).toBeInTheDocument();
    // Both directions of the exchange are shown.
    expect(screen.getAllByText('Guitar').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Python').length).toBeGreaterThan(0);
    // Both fixtures share the mutual interest, hence getAllByText.
    expect(screen.getAllByText('Hiking')).toHaveLength(2);
  });

  it('shows the empty state when no reciprocal matches exist', async () => {
    renderPage();

    expect(await screen.findByText(/no matches found/i)).toBeInTheDocument();
  });

  it('sends a request with the offered/requested skill ids and confirms inline', async () => {
    const user = userEvent.setup();
    getMatches.mockResolvedValue([makeMatch()]);
    sendMatchRequest.mockResolvedValue(undefined);

    renderPage();

    await user.click(await screen.findByRole('button', { name: /send request/i }));

    // The card prefers the catalog id over the user-skill id when both exist.
    await waitFor(() => expect(sendMatchRequest).toHaveBeenCalledWith(7, [101], [102]));
    const banner = await screen.findByTestId('error-banner');
    expect(banner).toHaveTextContent(/request sent to ada partner/i);
    expect(banner.className).toContain('bg-green-50');
    // The card locks after a successful send.
    expect(screen.getByRole('button', { name: /already sent/i })).toBeDisabled();
  });

  it('surfaces the API error inline and keeps the card actionable', async () => {
    const user = userEvent.setup();
    getMatches.mockResolvedValue([makeMatch()]);
    sendMatchRequest.mockRejectedValue(new Error('You already have a pending request'));

    renderPage();

    await user.click(await screen.findByRole('button', { name: /send request/i }));

    const banner = await screen.findByTestId('error-banner');
    expect(banner).toHaveTextContent(/pending request/i);
    expect(banner.className).toContain('bg-red-50');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /send request/i })).toBeEnabled(),
    );
  });

  it('disables sending to a partner who was already requested', async () => {
    getMatches.mockResolvedValue([makeMatch()]);
    hasAlreadyRequested.mockResolvedValue(true);

    renderPage();

    expect(await screen.findByRole('button', { name: /already sent/i })).toBeDisabled();
    expect(sendMatchRequest).not.toHaveBeenCalled();
  });
});

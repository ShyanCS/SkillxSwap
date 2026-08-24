import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPage from '../AdminPage';

const {
  getStats,
  getUsers,
  suspendUser,
  activateUser,
  getSkills,
  deleteSkill,
  getReports,
  resolveReport,
} = vi.hoisted(() => ({
  getStats: vi.fn(),
  getUsers: vi.fn(),
  suspendUser: vi.fn(),
  activateUser: vi.fn(),
  getSkills: vi.fn(),
  deleteSkill: vi.fn(),
  getReports: vi.fn(),
  resolveReport: vi.fn(),
}));

vi.mock('../../contexts/AdminContext', () => ({
  useAdmin: () => ({
    getStats,
    getUsers,
    suspendUser,
    activateUser,
    getSkills,
    deleteSkill,
    getReports,
    resolveReport,
  }),
}));

const STATS = {
  totalUsers: 2,
  totalSkillsInCatalog: 17,
  scheduledSessions: 3,
  completedSessions: 5,
  creditsInCirculation: 40,
  openReports: 1,
};

function makeUser(overrides = {}) {
  return {
    id: 1,
    name: 'Alice User',
    email: 'alice@example.com',
    role: 'USER',
    rating: 4.25,
    createdAt: '2026-01-15T00:00:00Z',
    enabled: true,
    ...overrides,
  };
}

const REPORTS = [
  {
    id: 9,
    reporterName: 'Bob',
    reportedUserName: 'Mallory',
    createdAt: '2026-08-01T00:00:00Z',
    status: 'Open',
    reason: 'Spam messages',
  },
];

function renderAdmin() {
  return render(<AdminPage />);
}

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getStats.mockResolvedValue(STATS);
    getUsers.mockResolvedValue({
      items: [makeUser()],
      page: 0,
      totalPages: 1,
      totalElements: 1,
    });
    getSkills.mockResolvedValue([{ id: 101, name: 'Guitar' }]);
    getReports.mockResolvedValue(REPORTS);
    suspendUser.mockResolvedValue(undefined);
    activateUser.mockResolvedValue(undefined);
    deleteSkill.mockResolvedValue(undefined);
    resolveReport.mockResolvedValue(undefined);
  });

  it('renders platform stats and the user roster', async () => {
    renderAdmin();

    expect(await screen.findByText('Alice User')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('17')).toBeInTheDocument(); // skills in catalog
    // Tab labels render lowercase; the count rides along as a sibling node.
    expect(screen.getByRole('button', { name: /reports \(1\)/i })).toBeInTheDocument();
  });

  it('suspends an active user and refreshes the roster', async () => {
    const user = userEvent.setup();

    renderAdmin();

    await user.click(await screen.findByRole('button', { name: /suspend/i }));

    await waitFor(() => expect(suspendUser).toHaveBeenCalledWith(1));
    // Stays on the current page rather than resetting to page one.
    await waitFor(() => expect(getUsers).toHaveBeenCalledTimes(2));
  });

  it('shows action failures inline instead of blocking dialogs', async () => {
    const user = userEvent.setup();
    suspendUser.mockRejectedValue(new Error('Cannot suspend another admin'));

    renderAdmin();

    await user.click(await screen.findByRole('button', { name: /suspend/i }));

    const banner = await screen.findByTestId('error-banner');
    expect(banner).toHaveTextContent(/cannot suspend another admin/i);
  });

  it('resolves an open report and refreshes reports and stats', async () => {
    const user = userEvent.setup();
    getReports
      .mockResolvedValueOnce(REPORTS)
      .mockResolvedValue([{ ...REPORTS[0], status: 'Resolved' }]);

    renderAdmin();

    await user.click(await screen.findByRole('button', { name: /^reports/i }));
    await user.click(await screen.findByRole('button', { name: /mark resolved/i }));

    await waitFor(() => expect(resolveReport).toHaveBeenCalledWith(9));
    await waitFor(() =>
      expect(screen.getByText('Resolved')).toBeInTheDocument(),
    );
  });

  it('removes a skill from the catalog via the skills tab', async () => {
    const user = userEvent.setup();

    renderAdmin();

    await user.click(await screen.findByRole('button', { name: /^skills/i }));
    // The icon-only remove button carries a title for accessibility.
    await user.click(screen.getByTitle('Remove from catalog'));

    await waitFor(() => expect(deleteSkill).toHaveBeenCalledWith(101));
    // Catalog is refetched after deletion.
    await waitFor(() => expect(getSkills).toHaveBeenCalledTimes(2));
  });
});

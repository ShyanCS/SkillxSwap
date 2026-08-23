import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { listSkill } = vi.hoisted(() => ({ listSkill: vi.fn() }));

vi.mock('../../../contexts/SkillsContext', () => ({
  useSkills: () => ({ listSkill }),
}));

import SkillFormModal from '../SkillFormModal';

const CATALOG = [
  { id: 101, name: 'Guitar' },
  { id: 102, name: 'Python Programming' },
];

const renderModal = (props = {}) =>
  render(
    <SkillFormModal
      type="offer"
      initial={null}
      onClose={vi.fn()}
      onSave={vi.fn().mockResolvedValue(undefined)}
      {...props}
    />,
  );

describe('SkillFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listSkill.mockResolvedValue(CATALOG);
  });

  it('fetches the catalog on mount and shows offer-mode fields for offers', async () => {
    renderModal({ type: 'offer' });

    expect(await screen.findByLabelText('Your Proficiency Level')).toBeInTheDocument();
    expect(screen.getByText('Monday AM')).toBeInTheDocument();
    expect(screen.queryByLabelText('Urgency')).not.toBeInTheDocument();
  });

  it('shows request-mode fields when adding a learning goal', async () => {
    renderModal({ type: 'request' });

    expect(await screen.findByLabelText(/desired proficiency/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Urgency')).toBeInTheDocument();
    expect(screen.queryByText('Monday AM')).not.toBeInTheDocument();
  });

  it('rejects a submit when the typed name is not a catalog entry', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderModal({ onSave });

    await screen.findByPlaceholderText('Type to search skills...');
    // The description is a required field; browsers block submit until it is
    // filled, and jsdom enforces the same constraint.
    await user.type(screen.getByLabelText('Description'), 'Anything');
    await user.click(screen.getByRole('button', { name: /add skill/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/select a skill from the suggestions/i);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('submits a normalized payload after picking a suggestion', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderModal({ type: 'offer', onClose, onSave });

    const search = await screen.findByPlaceholderText('Type to search skills...');
    await user.type(search, 'gui');
    await user.click(await screen.findByRole('button', { name: 'Guitar' }));
    await user.type(screen.getByLabelText('Description'), 'Strumming basics');
    await user.click(screen.getByRole('button', { name: 'Tuesday PM' }));
    await user.click(screen.getByRole('button', { name: /add skill/i }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(null, {
        name: 'Guitar',
        skillId: 101,
        description: 'Strumming basics',
        proficiencyLevel: 'Intermediate',
        desiredProficiency: 'Intermediate',
        urgency: 'Medium',
        availability: ['Tuesday PM'],
        type: 'offer',
        status: 'Active',
        matchCount: 0,
        sessionCount: 0,
        newSkillId: 101,
      }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps the modal open with the API error visible when saving fails', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSave = vi.fn().mockRejectedValue(new Error('Skill already added'));
    renderModal({ onClose, onSave });

    const search = await screen.findByPlaceholderText('Type to search skills...');
    // A partial query keeps the suggestion list open; typing the exact name
    // would hide it (exact match suppresses the dropdown by design).
    await user.type(search, 'Gui');
    await user.click(await screen.findByRole('button', { name: 'Guitar' }));
    await user.type(screen.getByLabelText('Description'), 'Anything');
    await user.click(screen.getByRole('button', { name: /add skill/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Skill already added');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('pre-fills from an existing skill in edit mode and passes its id to onSave', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderModal({
      type: 'offer',
      initial: {
        id: 55,
        name: 'Guitar',
        skillId: 101,
        description: 'Existing description',
        proficiencyLevel: 'Advanced',
        availability: ['Friday AM'],
      },
      onSave,
    });

    expect(await screen.findByText('Edit Skill')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Advanced')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Description'), ' plus chords');
    await user.click(screen.getByRole('button', { name: /add skill/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const [, payload] = onSave.mock.calls[0];
    expect(payload.description).toBe('Existing description plus chords');
    // The existing user-skill id travels as the first argument.
    expect(onSave.mock.calls[0][0]).toBe(55);
  });

  it('closes without saving on cancel', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ onClose });

    await user.click(await screen.findByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

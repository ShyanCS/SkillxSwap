import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SkillCard from '../SkillCard';

const baseSkill = {
  id: 9,
  name: 'Guitar',
  description: 'Acoustic basics and chord shapes',
  status: 'Active',
  matchCount: 3,
};

describe('SkillCard', () => {
  it('renders the skill identity and counters', () => {
    render(<SkillCard skill={baseSkill} type="offer" onDelete={vi.fn()} onEdit={vi.fn()} />);

    expect(screen.getByText('Guitar')).toBeInTheDocument();
    expect(screen.getByText('Acoustic basics and chord shapes')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('3 matches')).toBeInTheDocument();
  });

  it('shows offer metadata for offered skills, including availability slots', () => {
    render(
      <SkillCard
        skill={{ ...baseSkill, proficiencyLevel: 'Advanced', sessionCount: 4, availability: ['Monday AM'] }}
        type="offer"
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText('Advanced')).toBeInTheDocument();
    expect(screen.getByText('Monday AM')).toBeInTheDocument();
    expect(screen.getByText('4 sessions')).toBeInTheDocument();
    expect(screen.queryByText(/target:/i)).not.toBeInTheDocument();
  });

  it('shows request metadata for wanted skills instead of availability', () => {
    render(
      <SkillCard
        skill={{ ...baseSkill, desiredProficiency: 'Beginner', urgency: 'High' }}
        type="request"
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText('Target: Beginner')).toBeInTheDocument();
    expect(screen.getByText('High Priority')).toBeInTheDocument();
    expect(screen.queryByText(/sessions/)).not.toBeInTheDocument();
  });

  it('wires edit and delete to their handlers', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<SkillCard skill={baseSkill} type="offer" onDelete={onDelete} onEdit={onEdit} />);

    await user.click(screen.getByRole('button', { name: /edit guitar/i }));
    await user.click(screen.getByRole('button', { name: /delete guitar/i }));

    expect(onEdit).toHaveBeenCalledWith(baseSkill);
    expect(onDelete).toHaveBeenCalledWith(9);
  });
});

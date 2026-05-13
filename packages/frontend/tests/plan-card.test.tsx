import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PlanCard } from '../src/components/PlanCard';
import { VacationPlan } from '../src/types/plans';

const basePlan: VacationPlan = {
  id: 'p1',
  userId: 'u1',
  name: 'Summer Escape',
  destination: 'Barcelona',
  startDate: '2026-07-10',
  endDate: '2026-07-16',
  budget: 3200,
  description: 'Beach and food',
  status: 'upcoming',
  durationDays: 7,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('PlanCard', () => {
  it('displays plan summary fields', () => {
    render(
      <PlanCard
        plan={basePlan}
        onView={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Summer Escape')).toBeInTheDocument();
    expect(screen.getByText('Barcelona')).toBeInTheDocument();
    expect(screen.getByText(/\$3,200/)).toBeInTheDocument();
    expect(screen.getByText('upcoming')).toBeInTheDocument();
  });

  it('clicking card calls onView', () => {
    const onView = vi.fn();

    render(
      <PlanCard
        plan={basePlan}
        onView={onView}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText('View plan Summer Escape'));
    expect(onView).toHaveBeenCalledWith('p1');
  });
});

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivitiesList } from '../src/components/ActivitiesList';
import { Activity } from '../src/types/activities';

describe('ActivitiesList', () => {
  const mockActivities: Activity[] = [
    {
      id: 'a1',
      planId: 'p1',
      name: 'Breakfast',
      date: '2026-08-01',
      startTime: '08:00',
      cost: 20,
      category: 'dining',
    },
    {
      id: 'a2',
      planId: 'p1',
      name: 'Museum Visit',
      date: '2026-08-01',
      startTime: '10:00',
      cost: 30,
      category: 'sightseeing',
    },
    {
      id: 'a3',
      planId: 'p1',
      name: 'Dinner',
      date: '2026-08-02',
      startTime: '19:00',
      cost: 50,
      category: 'dining',
    },
  ];

  it('renders "No activities yet" empty state when activities array is empty', () => {
    render(<ActivitiesList activities={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);
    
    expect(screen.getByText(/no activities yet/i)).toBeInTheDocument();
  });

  it('shows date headers for each unique date', () => {
    render(<ActivitiesList activities={mockActivities} onEdit={vi.fn()} onDelete={vi.fn()} />);
    
    expect(screen.getByText(/aug 1, 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/aug 2, 2026/i)).toBeInTheDocument();
  });

  it('activities sorted chronologically within date groups', () => {
    const unsortedActivities: Activity[] = [
      {
        id: 'a2',
        planId: 'p1',
        name: 'Museum Visit',
        date: '2026-08-01',
        startTime: '10:00',
        cost: 30,
        category: 'sightseeing',
      },
      {
        id: 'a1',
        planId: 'p1',
        name: 'Breakfast',
        date: '2026-08-01',
        startTime: '08:00',
        cost: 20,
        category: 'dining',
      },
    ];

    render(<ActivitiesList activities={unsortedActivities} onEdit={vi.fn()} onDelete={vi.fn()} />);
    
    const activities = screen.getAllByRole('article');
    expect(activities[0]).toHaveTextContent('Breakfast');
    expect(activities[1]).toHaveTextContent('Museum Visit');
  });

  it('shows total cost per day', () => {
    render(<ActivitiesList activities={mockActivities} onEdit={vi.fn()} onDelete={vi.fn()} />);
    
    // Aug 1: $20 + $30 = $50, Aug 2: $50
    const totals = screen.getAllByText(/total: \$50/i);
    expect(totals).toHaveLength(2);
  });

  it('calls onEdit with correct activity', async () => {
    const onEdit = vi.fn();
    render(<ActivitiesList activities={mockActivities} onEdit={onEdit} onDelete={vi.fn()} />);
    
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await userEvent.click(editButtons[0]);
    
    expect(onEdit).toHaveBeenCalledWith(mockActivities[0]);
  });

  it('calls onDelete with correct activity', async () => {
    const onDelete = vi.fn();
    render(<ActivitiesList activities={mockActivities} onEdit={vi.fn()} onDelete={onDelete} />);
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await userEvent.click(deleteButtons[1]);
    
    expect(onDelete).toHaveBeenCalledWith(mockActivities[1]);
  });
});

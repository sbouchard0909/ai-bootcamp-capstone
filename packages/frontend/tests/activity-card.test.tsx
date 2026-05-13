import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityCard } from '../src/components/ActivityCard';

describe('ActivityCard', () => {
  const mockActivity = {
    id: 'a1',
    planId: 'p1',
    name: 'Lunch at Bistro',
    date: '2026-08-01',
    startTime: '12:00',
    endTime: '13:30',
    cost: 45,
    category: 'dining' as const,
    location: 'Paris',
    description: 'Great local spot',
  };

  it('displays activity name', () => {
    render(<ActivityCard activity={mockActivity} onEdit={vi.fn()} onDelete={vi.fn()} />);
    
    expect(screen.getByText('Lunch at Bistro')).toBeInTheDocument();
  });

  it('shows category icon and label badge', () => {
    render(<ActivityCard activity={mockActivity} onEdit={vi.fn()} onDelete={vi.fn()} />);
    
    expect(screen.getByText('🍽️')).toBeInTheDocument();
    expect(screen.getByText('Dining')).toBeInTheDocument();
  });

  it('displays formatted cost and location', () => {
    render(<ActivityCard activity={mockActivity} onEdit={vi.fn()} onDelete={vi.fn()} />);
    
    expect(screen.getByText('$45')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });

  it('edit button calls onEdit callback', async () => {
    const onEdit = vi.fn();
    render(<ActivityCard activity={mockActivity} onEdit={onEdit} onDelete={vi.fn()} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);
    
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('delete button calls onDelete callback', async () => {
    const onDelete = vi.fn();
    render(<ActivityCard activity={mockActivity} onEdit={vi.fn()} onDelete={onDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});

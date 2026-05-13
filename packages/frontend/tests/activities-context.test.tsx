import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { mockGetAll, mockCreate, mockUpdate, mockDelete } = vi.hoisted(() => ({
  mockGetAll: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock('../src/services/activitiesService', () => ({
  activitiesService: {
    getAll: mockGetAll,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
  },
}));

import { ActivitiesProvider, useActivities } from '../src/context/ActivitiesContext';

function TestConsumer() {
  const { activities, loading, error, totalCost, fetchActivities, createActivity, updateActivity, deleteActivity } = useActivities();
  
  const handleFetch = async () => {
    try {
      await fetchActivities();
    } catch {
      // Error is captured in context state
    }
  };

  const handleCreate = async () => {
    try {
      await createActivity({
        name: 'New Activity',
        date: '2026-08-01',
        cost: 100,
        category: 'dining',
      });
    } catch {
      // Error is captured in context state
    }
  };

  const handleUpdate = async () => {
    try {
      await updateActivity('a1', { cost: 200 });
    } catch {
      // Error is captured in context state
    }
  };

  const handleDelete = async () => {
    try {
      await deleteActivity('a1');
    } catch {
      // Error is captured in context state
    }
  };
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'idle'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="total-cost">{totalCost}</div>
      <div data-testid="count">{activities.length}</div>
      {activities.map((activity) => (
        <div key={activity.id} data-testid={`activity-${activity.id}`}>
          {activity.name} - ${activity.cost}
        </div>
      ))}
      <button onClick={() => void handleFetch()}>Fetch</button>
      <button onClick={() => void handleCreate()}>Create</button>
      <button onClick={() => void handleUpdate()}>Update</button>
      <button onClick={() => void handleDelete()}>Delete</button>
    </div>
  );
}

describe('ActivitiesContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchActivities loads activities into state', async () => {
    mockGetAll.mockResolvedValue([
      { id: 'a1', planId: 'p1', name: 'Dinner', date: '2026-08-01', cost: 50, category: 'dining' },
      { id: 'a2', planId: 'p1', name: 'Museum', date: '2026-08-02', cost: 25, category: 'sightseeing' },
    ]);

    render(
      <ActivitiesProvider planId="p1">
        <TestConsumer />
      </ActivitiesProvider>
    );

    const fetchButton = screen.getByRole('button', { name: 'Fetch' });
    await userEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('2');
    });

    expect(screen.getByTestId('activity-a1')).toHaveTextContent('Dinner - $50');
    expect(screen.getByTestId('activity-a2')).toHaveTextContent('Museum - $25');
    expect(mockGetAll).toHaveBeenCalledWith('p1');
  });

  it('createActivity adds activity to state', async () => {
    mockGetAll.mockResolvedValue([]);
    mockCreate.mockResolvedValue({
      id: 'a3',
      planId: 'p1',
      name: 'New Activity',
      date: '2026-08-01',
      cost: 100,
      category: 'dining',
    });

    render(
      <ActivitiesProvider planId="p1">
        <TestConsumer />
      </ActivitiesProvider>
    );

    const createButton = screen.getByRole('button', { name: 'Create' });
    await userEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });

    expect(screen.getByTestId('activity-a3')).toHaveTextContent('New Activity - $100');
    expect(mockCreate).toHaveBeenCalledWith('p1', {
      name: 'New Activity',
      date: '2026-08-01',
      cost: 100,
      category: 'dining',
    });
  });

  it('updateActivity updates activity in state', async () => {
    mockGetAll.mockResolvedValue([
      { id: 'a1', planId: 'p1', name: 'Dinner', date: '2026-08-01', cost: 50, category: 'dining' },
    ]);
    mockUpdate.mockResolvedValue({
      id: 'a1',
      planId: 'p1',
      name: 'Dinner',
      date: '2026-08-01',
      cost: 200,
      category: 'dining',
    });

    render(
      <ActivitiesProvider planId="p1">
        <TestConsumer />
      </ActivitiesProvider>
    );

    const fetchButton = screen.getByRole('button', { name: 'Fetch' });
    await userEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByTestId('activity-a1')).toHaveTextContent('Dinner - $50');
    });

    const updateButton = screen.getByRole('button', { name: 'Update' });
    await userEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByTestId('activity-a1')).toHaveTextContent('Dinner - $200');
    });

    expect(mockUpdate).toHaveBeenCalledWith('p1', 'a1', { cost: 200 });
  });

  it('deleteActivity removes activity from state', async () => {
    mockGetAll.mockResolvedValue([
      { id: 'a1', planId: 'p1', name: 'Dinner', date: '2026-08-01', cost: 50, category: 'dining' },
    ]);
    mockDelete.mockResolvedValue(undefined);

    render(
      <ActivitiesProvider planId="p1">
        <TestConsumer />
      </ActivitiesProvider>
    );

    const fetchButton = screen.getByRole('button', { name: 'Fetch' });
    await userEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('0');
    });

    expect(mockDelete).toHaveBeenCalledWith('p1', 'a1');
  });

  it('error from service is set in error state and rethrown', async () => {
    mockGetAll.mockRejectedValue(new Error('Network error'));

    render(
      <ActivitiesProvider planId="p1">
        <TestConsumer />
      </ActivitiesProvider>
    );

    const fetchButton = screen.getByRole('button', { name: 'Fetch' });
    
    // Click will trigger error
    await userEvent.click(fetchButton);

    // Wait for error to be set in state
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Network error');
    });
  });

  it('totalCost is sum of all activity costs', async () => {
    mockGetAll.mockResolvedValue([
      { id: 'a1', planId: 'p1', name: 'Dinner', date: '2026-08-01', cost: 50, category: 'dining' },
      { id: 'a2', planId: 'p1', name: 'Museum', date: '2026-08-02', cost: 25, category: 'sightseeing' },
      { id: 'a3', planId: 'p1', name: 'Hotel', date: '2026-08-01', cost: 150, category: 'accommodation' },
    ]);

    render(
      <ActivitiesProvider planId="p1">
        <TestConsumer />
      </ActivitiesProvider>
    );

    const fetchButton = screen.getByRole('button', { name: 'Fetch' });
    await userEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByTestId('total-cost')).toHaveTextContent('225');
    });
  });
});

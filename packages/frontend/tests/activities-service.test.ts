import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGet, mockPost, mockPut, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPut: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock('../src/services/api', () => ({
  default: {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
  },
}));

import { activitiesService } from '../src/services/activitiesService';

describe('activitiesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll calls activities endpoint and returns activities array', async () => {
    mockGet.mockResolvedValue({
      data: {
        data: {
          activities: [
            { id: 'a1', name: 'Dinner', planId: 'p1', date: '2026-08-01', cost: 50, category: 'dining' },
          ],
        },
      },
    });

    const activities = await activitiesService.getAll('p1');

    expect(mockGet).toHaveBeenCalledWith('/api/v1/plans/p1/activities');
    expect(activities).toEqual([
      { id: 'a1', name: 'Dinner', planId: 'p1', date: '2026-08-01', cost: 50, category: 'dining' },
    ]);
  });

  it('getById calls activity by id endpoint and returns activity', async () => {
    mockGet.mockResolvedValue({
      data: {
        data: {
          activity: { id: 'a1', name: 'Dinner', planId: 'p1', date: '2026-08-01', cost: 50, category: 'dining' },
        },
      },
    });

    const activity = await activitiesService.getById('p1', 'a1');

    expect(mockGet).toHaveBeenCalledWith('/api/v1/plans/p1/activities/a1');
    expect(activity).toEqual({ id: 'a1', name: 'Dinner', planId: 'p1', date: '2026-08-01', cost: 50, category: 'dining' });
  });

  it('create posts data and returns created activity', async () => {
    const activityData = {
      name: 'Museum Visit',
      date: '2026-08-02',
      startTime: '10:00',
      endTime: '12:00',
      cost: 25,
      category: 'sightseeing' as const,
      location: 'Louvre',
    };

    mockPost.mockResolvedValue({
      data: {
        data: {
          activity: { id: 'a2', planId: 'p1', ...activityData },
        },
      },
    });

    const created = await activitiesService.create('p1', activityData);

    expect(mockPost).toHaveBeenCalledWith('/api/v1/plans/p1/activities', activityData);
    expect(created).toEqual({ id: 'a2', planId: 'p1', ...activityData });
  });

  it('update puts data and returns updated activity', async () => {
    const updateData = {
      cost: 30,
      endTime: '13:00',
    };

    mockPut.mockResolvedValue({
      data: {
        data: {
          activity: {
            id: 'a1',
            planId: 'p1',
            name: 'Museum Visit',
            date: '2026-08-02',
            startTime: '10:00',
            endTime: '13:00',
            cost: 30,
            category: 'sightseeing',
            location: 'Louvre',
          },
        },
      },
    });

    const updated = await activitiesService.update('p1', 'a1', updateData);

    expect(mockPut).toHaveBeenCalledWith('/api/v1/plans/p1/activities/a1', updateData);
    expect(updated.cost).toBe(30);
    expect(updated.endTime).toBe('13:00');
  });

  it('delete calls delete endpoint', async () => {
    mockDelete.mockResolvedValue(undefined);

    await activitiesService.delete('p1', 'a1');

    expect(mockDelete).toHaveBeenCalledWith('/api/v1/plans/p1/activities/a1');
  });
});

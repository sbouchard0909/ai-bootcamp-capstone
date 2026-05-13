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

import { plansService } from '../src/services/plansService';

describe('plansService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll calls plans endpoint and returns plans array', async () => {
    mockGet.mockResolvedValue({ data: { data: { plans: [{ id: 'p1' }] } } });

    const plans = await plansService.getAll();

    expect(mockGet).toHaveBeenCalledWith('/api/v1/plans');
    expect(plans).toEqual([{ id: 'p1' }]);
  });

  it('create posts data and returns created plan', async () => {
    mockPost.mockResolvedValue({ data: { data: { plan: { id: 'p2', name: 'Trip' } } } });

    const created = await plansService.create({
      name: 'Trip',
      destination: 'Rome',
      startDate: '2026-08-01',
      endDate: '2026-08-07',
      budget: 2500,
    });

    expect(mockPost).toHaveBeenCalledWith('/api/v1/plans', {
      name: 'Trip',
      destination: 'Rome',
      startDate: '2026-08-01',
      endDate: '2026-08-07',
      budget: 2500,
    });
    expect(created).toEqual({ id: 'p2', name: 'Trip' });
  });

  it('update puts data and returns updated plan', async () => {
    mockPut.mockResolvedValue({ data: { data: { plan: { id: 'p2', name: 'Updated' } } } });

    const updated = await plansService.update('p2', { name: 'Updated' });

    expect(mockPut).toHaveBeenCalledWith('/api/v1/plans/p2', { name: 'Updated' });
    expect(updated).toEqual({ id: 'p2', name: 'Updated' });
  });

  it('delete calls delete endpoint', async () => {
    mockDelete.mockResolvedValue({});

    await plansService.delete('p2');

    expect(mockDelete).toHaveBeenCalledWith('/api/v1/plans/p2');
  });

  it('rethrows API errors', async () => {
    mockGet.mockRejectedValue(new Error('boom'));

    await expect(plansService.getAll()).rejects.toThrow('boom');
  });
});

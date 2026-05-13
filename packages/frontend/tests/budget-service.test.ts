import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
}));

vi.mock('../src/services/api', () => ({
  default: {
    get: mockGet,
  },
}));

import { budgetService } from '../src/services/budgetService';

describe('budgetService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getBudgetDetails calls budget endpoint and maps payload', async () => {
    mockGet.mockResolvedValue({
      data: {
        data: {
          budget: 1000,
          totalSpent: 850,
          remainingBudget: 150,
          budgetUtilization: 85,
          costByCategory: { dining: 400, transport: 200, accommodation: 250 },
          costByDate: { '2026-09-01': 500, '2026-09-02': 350 },
          warnings: ['Budget usage has reached 80% or more'],
        },
      },
    });

    const budget = await budgetService.getBudgetDetails('plan-1');

    expect(mockGet).toHaveBeenCalledWith('/api/v1/plans/plan-1/budget');
    expect(budget).toEqual({
      totalBudget: 1000,
      totalSpent: 850,
      remainingBudget: 150,
      budgetUtilization: 85,
      costByCategory: { dining: 400, transport: 200, accommodation: 250 },
      costByDate: { '2026-09-01': 500, '2026-09-02': 350 },
      warnings: ['Budget usage has reached 80% or more'],
      isOverBudget: false,
    });
  });

  it('sets isOverBudget true when remaining budget is negative', async () => {
    mockGet.mockResolvedValue({
      data: {
        data: {
          budget: 100,
          totalSpent: 125,
          remainingBudget: -25,
          budgetUtilization: 125,
          costByCategory: { other: 125 },
          costByDate: { '2026-09-01': 125 },
          warnings: ['Plan is over budget'],
        },
      },
    });

    const budget = await budgetService.getBudgetDetails('plan-2');

    expect(budget.isOverBudget).toBe(true);
  });

  it('rethrows API errors', async () => {
    mockGet.mockRejectedValue(new Error('budget fetch failed'));

    await expect(budgetService.getBudgetDetails('plan-3')).rejects.toThrow('budget fetch failed');
  });
});

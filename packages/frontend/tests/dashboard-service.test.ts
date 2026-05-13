import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dashboardService } from '../src/services/dashboardService';
import api from '../src/services/api';

vi.mock('../src/services/api');

describe('dashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('should fetch dashboard data from the API', async () => {
      const mockDashboardData = {
        upcomingPlans: [
          {
            id: 'p1',
            userId: 'u1',
            name: 'Summer Vacation',
            destination: 'Hawaii',
            startDate: '2026-07-01',
            endDate: '2026-07-15',
            budget: 5000,
            status: 'upcoming' as const,
            durationDays: 15,
            totalSpent: 1200,
            remainingBudget: 3800,
            budgetUtilization: 24,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
        activePlans: [],
        completedPlans: [],
        statistics: {
          totalPlans: 1,
          totalBudget: 5000,
          totalSpent: 1200,
          plansByStatus: { upcoming: 1 },
        },
      };

      vi.mocked(api.get).mockResolvedValue({
        data: {
          data: mockDashboardData,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      } as never);

      const result = await dashboardService.getDashboard();

      expect(api.get).toHaveBeenCalledWith('/api/v1/dashboard');
      expect(result).toEqual(mockDashboardData);
    });

    it('should throw error when API call fails', async () => {
      const mockError = new Error('Network error');
      vi.mocked(api.get).mockRejectedValue(mockError);

      await expect(dashboardService.getDashboard()).rejects.toThrow('Network error');
    });

    it('should handle empty dashboard data', async () => {
      const mockEmptyData = {
        upcomingPlans: [],
        activePlans: [],
        completedPlans: [],
        statistics: {
          totalPlans: 0,
          totalBudget: 0,
          totalSpent: 0,
          plansByStatus: {},
        },
      };

      vi.mocked(api.get).mockResolvedValue({
        data: {
          data: mockEmptyData,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      } as never);

      const result = await dashboardService.getDashboard();

      expect(result.upcomingPlans).toEqual([]);
      expect(result.statistics.totalPlans).toBe(0);
    });
  });
});

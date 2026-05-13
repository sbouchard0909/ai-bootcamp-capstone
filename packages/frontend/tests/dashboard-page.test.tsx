import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from '../src/pages/DashboardPage';
import { dashboardService } from '../src/services/dashboardService';
import userEvent from '@testing-library/user-event';

vi.mock('../src/services/dashboardService');

const mockUseAuth = vi.fn();

vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUser = {
  id: 'u1',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: '',
  updatedAt: '',
};

function renderDashboard() {
  return render(
    <BrowserRouter>
      <DashboardPage />
    </BrowserRouter>
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      token: 'mock-token',
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
  });

  describe('Loading State', () => {
    it('should display loading message while fetching data', () => {
      vi.mocked(dashboardService.getDashboard).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderDashboard();

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Welcome Message', () => {
    it('should display welcome message with user name', async () => {
      vi.mocked(dashboardService.getDashboard).mockResolvedValue({
        upcomingPlans: [],
        activePlans: [],
        completedPlans: [],
        statistics: {
          totalPlans: 0,
          totalBudget: 0,
          totalSpent: 0,
          plansByStatus: {},
        },
      });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
      });

      expect(screen.getByText(/welcome.*test user/i)).toBeInTheDocument();
    });
  });

  describe('Statistics Cards', () => {
    it('should display statistics cards with correct values', async () => {
      vi.mocked(dashboardService.getDashboard).mockResolvedValue({
        upcomingPlans: [
          {
            id: 'p1',
            userId: 'u1',
            name: 'Trip 1',
            destination: 'Paris',
            startDate: '2026-08-01',
            endDate: '2026-08-10',
            budget: 3000,
            status: 'upcoming',
            createdAt: '',
            updatedAt: '',
          },
          {
            id: 'p2',
            userId: 'u1',
            name: 'Trip 2',
            destination: 'London',
            startDate: '2026-09-01',
            endDate: '2026-09-10',
            budget: 2000,
            status: 'upcoming',
            createdAt: '',
            updatedAt: '',
          },
        ],
        activePlans: [
          {
            id: 'p3',
            userId: 'u1',
            name: 'Active Trip',
            destination: 'Rome',
            startDate: '2026-05-10',
            endDate: '2026-05-20',
            budget: 2500,
            status: 'active',
            createdAt: '',
            updatedAt: '',
          },
        ],
        completedPlans: [],
        statistics: {
          totalPlans: 3,
          totalBudget: 7500,
          totalSpent: 2000,
          plansByStatus: { upcoming: 2, active: 1 },
        },
      });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument(); // Total plans
      });

      // Check statistics - use getAll to find all instances and verify they exist
      expect(screen.getByText('Total Budget')).toBeInTheDocument();
      expect(screen.getAllByText(/\$7,500/)[0]).toBeInTheDocument();
      
      expect(screen.getByText('Total Spent')).toBeInTheDocument();
      expect(screen.getAllByText(/\$2,000/)[0]).toBeInTheDocument();
      
      expect(screen.getByText('2')).toBeInTheDocument(); // Upcoming trips
      expect(screen.getByText('1')).toBeInTheDocument(); // Active trips
    });
  });

  describe('Active Trip Banner', () => {
    it('should display active trip banner when user has active trip', async () => {
      vi.mocked(dashboardService.getDashboard).mockResolvedValue({
        upcomingPlans: [],
        activePlans: [
          {
            id: 'p1',
            userId: 'u1',
            name: 'Current Adventure',
            destination: 'Tokyo',
            startDate: '2026-05-10',
            endDate: '2026-05-20',
            budget: 4000,
            status: 'active',
            durationDays: 11,
            totalSpent: 1500,
            remainingBudget: 2500,
            budgetUtilization: 37.5,
            createdAt: '',
            updatedAt: '',
          },
        ],
        completedPlans: [],
        statistics: {
          totalPlans: 1,
          totalBudget: 4000,
          totalSpent: 1500,
          plansByStatus: { active: 1 },
        },
      });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/current adventure/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/tokyo/i)).toBeInTheDocument();
      // Check for the active badge specifically
      const activeBadge = screen.getByText('Active');
      expect(activeBadge).toHaveClass('bg-blue-600');
    });

    it('should not display active trip banner when no active trips', async () => {
      vi.mocked(dashboardService.getDashboard).mockResolvedValue({
        upcomingPlans: [
          {
            id: 'p1',
            userId: 'u1',
            name: 'Future Trip',
            destination: 'Paris',
            startDate: '2026-08-01',
            endDate: '2026-08-10',
            budget: 3000,
            status: 'upcoming',
            createdAt: '',
            updatedAt: '',
          },
        ],
        activePlans: [],
        completedPlans: [],
        statistics: {
          totalPlans: 1,
          totalBudget: 3000,
          totalSpent: 0,
          plansByStatus: { upcoming: 1 },
        },
      });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/future trip/i)).toBeInTheDocument();
      });

      // Check that the active badge is not present
      const activeBadges = screen.queryAllByText('Active').filter(el => el.classList.contains('bg-blue-600'));
      expect(activeBadges).toHaveLength(0);
    });
  });

  describe('Upcoming Trips Section', () => {
    it('should display upcoming trips with trip details', async () => {
      vi.mocked(dashboardService.getDashboard).mockResolvedValue({
        upcomingPlans: [
          {
            id: 'p1',
            userId: 'u1',
            name: 'Summer Vacation',
            destination: 'Hawaii',
            startDate: '2026-07-01',
            endDate: '2026-07-15',
            budget: 5000,
            status: 'upcoming',
            durationDays: 15,
            totalSpent: 1200,
            remainingBudget: 3800,
            budgetUtilization: 24,
            createdAt: '',
            updatedAt: '',
          },
          {
            id: 'p2',
            userId: 'u1',
            name: 'Fall Adventure',
            destination: 'New York',
            startDate: '2026-10-01',
            endDate: '2026-10-07',
            budget: 3000,
            status: 'upcoming',
            durationDays: 7,
            createdAt: '',
            updatedAt: '',
          },
        ],
        activePlans: [],
        completedPlans: [],
        statistics: {
          totalPlans: 2,
          totalBudget: 8000,
          totalSpent: 1200,
          plansByStatus: { upcoming: 2 },
        },
      });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/summer vacation/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/hawaii/i)).toBeInTheDocument();
      expect(screen.getByText(/fall adventure/i)).toBeInTheDocument();
      expect(screen.getByText(/new york/i)).toBeInTheDocument();
    });

    it('should show "No upcoming trips" when no upcoming plans', async () => {
      vi.mocked(dashboardService.getDashboard).mockResolvedValue({
        upcomingPlans: [],
        activePlans: [],
        completedPlans: [
          {
            id: 'p1',
            userId: 'u1',
            name: 'Past Trip',
            destination: 'London',
            startDate: '2026-01-01',
            endDate: '2026-01-10',
            budget: 2000,
            status: 'completed',
            createdAt: '',
            updatedAt: '',
          },
        ],
        statistics: {
          totalPlans: 1,
          totalBudget: 2000,
          totalSpent: 1800,
          plansByStatus: { completed: 1 },
        },
      });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/no upcoming trips/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when user has no plans', async () => {
      vi.mocked(dashboardService.getDashboard).mockResolvedValue({
        upcomingPlans: [],
        activePlans: [],
        completedPlans: [],
        statistics: {
          totalPlans: 0,
          totalBudget: 0,
          totalSpent: 0,
          plansByStatus: {},
        },
      });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/no vacation plans yet/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /create your first plan/i })).toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    it('should display "Create Plan" button that navigates to plan creation', async () => {
      vi.mocked(dashboardService.getDashboard).mockResolvedValue({
        upcomingPlans: [],
        activePlans: [],
        completedPlans: [],
        statistics: {
          totalPlans: 0,
          totalBudget: 0,
          totalSpent: 0,
          plansByStatus: {},
        },
      });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create.*plan/i })).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: /create.*plan/i });
      expect(createButton).toHaveAttribute('type', 'button');
    });

    it('should display "View All Plans" link when user has plans', async () => {
      vi.mocked(dashboardService.getDashboard).mockResolvedValue({
        upcomingPlans: [
          {
            id: 'p1',
            userId: 'u1',
            name: 'Trip',
            destination: 'Paris',
            startDate: '2026-08-01',
            endDate: '2026-08-10',
            budget: 3000,
            status: 'upcoming',
            createdAt: '',
            updatedAt: '',
          },
        ],
        activePlans: [],
        completedPlans: [],
        statistics: {
          totalPlans: 1,
          totalBudget: 3000,
          totalSpent: 0,
          plansByStatus: { upcoming: 1 },
        },
      });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /view all plans/i })).toBeInTheDocument();
      });

      const viewAllLink = screen.getByRole('link', { name: /view all plans/i });
      expect(viewAllLink).toHaveAttribute('href', '/plans');
    });
  });

  describe('Error State', () => {
    it('should display error message when dashboard fetch fails', async () => {
      vi.mocked(dashboardService.getDashboard).mockRejectedValue(
        new Error('Failed to load dashboard')
      );

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/failed to load dashboard/i)).toBeInTheDocument();
      });
    });

    it('should allow retry after error', async () => {
      vi.mocked(dashboardService.getDashboard)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          upcomingPlans: [],
          activePlans: [],
          completedPlans: [],
          statistics: {
            totalPlans: 0,
            totalBudget: 0,
            totalSpent: 0,
            plansByStatus: {},
          },
        });

      const user = userEvent.setup();
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.queryByText(/network error/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Trip Card Navigation', () => {
    it('should navigate to plan details when clicking on a trip card', async () => {
      vi.mocked(dashboardService.getDashboard).mockResolvedValue({
        upcomingPlans: [
          {
            id: 'p1',
            userId: 'u1',
            name: 'Summer Trip',
            destination: 'Beach',
            startDate: '2026-07-01',
            endDate: '2026-07-10',
            budget: 2000,
            status: 'upcoming',
            createdAt: '',
            updatedAt: '',
          },
        ],
        activePlans: [],
        completedPlans: [],
        statistics: {
          totalPlans: 1,
          totalBudget: 2000,
          totalSpent: 0,
          plansByStatus: { upcoming: 1 },
        },
      });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/summer trip/i)).toBeInTheDocument();
      });

      const tripLink = screen.getByRole('link', { name: /view plan summer trip/i });
      expect(tripLink).toHaveAttribute('href', '/plans/p1');
    });
  });
});

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PlanDetailsPage } from '../src/pages/PlanDetailsPage';

const { mockDeletePlan, mockGetById } = vi.hoisted(() => ({
  mockDeletePlan: vi.fn(),
  mockGetById: vi.fn(),
}));

const { mockGetBudgetDetails } = vi.hoisted(() => ({
  mockGetBudgetDetails: vi.fn(),
}));

const { mockFetchActivities, mockUseActivities } = vi.hoisted(() => {
  const mockFetchActivities = vi.fn().mockResolvedValue(undefined);
  const mockCreateActivity = vi.fn();
  const mockUpdateActivity = vi.fn();
  const mockDeleteActivity = vi.fn();
  const mockUseActivities = vi.fn(() => ({
    activities: [] as import('../src/types/activities').Activity[],
    loading: false,
    error: null,
    totalCost: 0,
    fetchActivities: mockFetchActivities,
    createActivity: mockCreateActivity,
    updateActivity: mockUpdateActivity,
    deleteActivity: mockDeleteActivity,
  }));
  return { mockFetchActivities, mockUseActivities };
});

vi.mock('../src/context/PlansContext', () => ({
  usePlans: () => ({
    deletePlan: mockDeletePlan,
    plans: [],
    loading: false,
    error: null,
    fetchPlans: vi.fn(),
    createPlan: vi.fn(),
    updatePlan: vi.fn(),
  }),
}));

vi.mock('../src/services/plansService', () => ({
  plansService: {
    getById: mockGetById,
  },
}));

vi.mock('../src/services/budgetService', () => ({
  budgetService: {
    getBudgetDetails: mockGetBudgetDetails,
  },
}));

vi.mock('../src/context/ActivitiesContext', () => ({
  ActivitiesProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useActivities: mockUseActivities,
}));

const basePlan = {
  id: 'p1',
  userId: 'u1',
  name: 'Trip details',
  destination: 'Tokyo',
  startDate: '2026-09-01',
  endDate: '2026-09-08',
  budget: 5000,
  status: 'upcoming',
  durationDays: 8,
  description: 'Details',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/plans/p1']}>
      <Routes>
        <Route path="/plans/:id" element={<PlanDetailsPage />} />
        <Route path="/plans" element={<h1>Plans list</h1>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PlanDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchActivities.mockResolvedValue(undefined);
    mockGetById.mockResolvedValue({ ...basePlan });
    mockGetBudgetDetails.mockResolvedValue({
      totalBudget: 5000,
      totalSpent: 2500,
      remainingBudget: 2500,
      budgetUtilization: 50,
      costByCategory: { dining: 1500, transport: 1000 },
      costByDate: { '2026-09-01': 1000, '2026-09-02': 1500 },
      warnings: [],
      isOverBudget: false,
    });
  });

  it('renders plan details', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Trip details')).toBeInTheDocument();
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
    });
  });

  it('delete opens confirmation and confirms delete', async () => {
    mockDeletePlan.mockResolvedValue(undefined);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Trip details')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByRole('dialog', { name: 'Delete confirmation' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }));

    await waitFor(() => {
      expect(mockDeletePlan).toHaveBeenCalledWith('p1');
      expect(screen.getByText('Plans list')).toBeInTheDocument();
    });
  });

  it('renders Activities section heading', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Activities')).toBeInTheDocument();
    });
  });

  it('renders Add Activity button', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add activity/i })).toBeInTheDocument();
    });
  });

  it('shows total budget, spent, and remaining in budget section', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Total Budget')).toBeInTheDocument();
      expect(screen.getByText('Total Spent')).toBeInTheDocument();
      expect(screen.getByText('Remaining Budget')).toBeInTheDocument();
    });
  });

  it('renders progress bar with correct percentage', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('budget-utilization')).toHaveTextContent('50%');
      expect(screen.getByTestId('budget-progress-fill')).toHaveStyle({ width: '50%' });
    });
  });

  it('shows yellow styling between 75 and 100 percent utilization', async () => {
    mockGetBudgetDetails.mockResolvedValue({
      totalBudget: 1000,
      totalSpent: 900,
      remainingBudget: 100,
      budgetUtilization: 90,
      costByCategory: { dining: 900 },
      costByDate: { '2026-09-01': 900 },
      warnings: ['Budget usage has reached 80% or more'],
      isOverBudget: false,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('budget-progress-fill').className).toContain('bg-amber-500');
    });
  });

  it('shows red styling and over budget label above 100 percent utilization', async () => {
    mockGetBudgetDetails.mockResolvedValue({
      totalBudget: 1000,
      totalSpent: 1200,
      remainingBudget: -200,
      budgetUtilization: 120,
      costByCategory: { dining: 1200 },
      costByDate: { '2026-09-01': 1200 },
      warnings: ['Plan is over budget'],
      isOverBudget: true,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText(/over budget/i).length).toBeGreaterThan(0);
      expect(screen.getByTestId('budget-progress-fill').className).toContain('bg-red-500');
    });
  });

  it('shows no alert below 90 percent utilization', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('shows and dismisses warning alert above 90 percent utilization', async () => {
    mockGetBudgetDetails.mockResolvedValue({
      totalBudget: 1000,
      totalSpent: 950,
      remainingBudget: 50,
      budgetUtilization: 95,
      costByCategory: { dining: 950 },
      costByDate: { '2026-09-01': 950 },
      warnings: ['Budget usage has reached 80% or more'],
      isOverBudget: false,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('renders budget breakdown chart and timeline chart', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('img', { name: /budget breakdown chart/i })).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /spending timeline chart/i })).toBeInTheDocument();
    });
  });

  it('shows categories without spending as zero in breakdown table', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText(/Other/).length).toBeGreaterThan(0);
      const zeroValues = screen.getAllByText('$0');
      expect(zeroValues.length).toBeGreaterThan(0);
    });
  });

  it('clicking Add Activity shows activity form modal', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add activity/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /add activity/i }));

    expect(screen.getByText(/add activity/i, { selector: 'h2' })).toBeInTheDocument();
  });
});

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PlanDetailsPage } from '../src/pages/PlanDetailsPage';

const { mockDeletePlan, mockGetById } = vi.hoisted(() => ({
  mockDeletePlan: vi.fn(),
  mockGetById: vi.fn(),
}));

const { mockFetchActivities, mockCreateActivity, mockUpdateActivity, mockDeleteActivity, mockUseActivities } = vi.hoisted(() => {
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
  return { mockFetchActivities, mockCreateActivity, mockUpdateActivity, mockDeleteActivity, mockUseActivities };
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

  it('shows total activities cost in budget section', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Total Activities Cost')).toBeInTheDocument();
    });
  });

  it('shows remaining budget', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Remaining Budget')).toBeInTheDocument();
    });
  });

  it('shows over-budget warning when total cost exceeds plan budget', async () => {
    mockUseActivities.mockReturnValue({
      activities: [],
      loading: false,
      error: null,
      totalCost: 6000,
      fetchActivities: mockFetchActivities,
      createActivity: mockCreateActivity,
      updateActivity: mockUpdateActivity,
      deleteActivity: mockDeleteActivity,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/over budget/i)).toBeInTheDocument();
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

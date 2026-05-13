import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PlanDetailsPage } from '../src/pages/PlanDetailsPage';

const { mockDeletePlan, mockGetById } = vi.hoisted(() => ({
  mockDeletePlan: vi.fn(),
  mockGetById: vi.fn(),
}));

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

describe('PlanDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetById.mockResolvedValue({
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
    });
  });

  it('renders plan details', async () => {
    render(
      <MemoryRouter initialEntries={['/plans/p1']}>
        <Routes>
          <Route path="/plans/:id" element={<PlanDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Trip details')).toBeInTheDocument();
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
    });
  });

  it('delete opens confirmation and confirms delete', async () => {
    mockDeletePlan.mockResolvedValue(undefined);

    render(
      <MemoryRouter initialEntries={['/plans/p1']}>
        <Routes>
          <Route path="/plans/:id" element={<PlanDetailsPage />} />
          <Route path="/plans" element={<h1>Plans list</h1>} />
        </Routes>
      </MemoryRouter>
    );

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
});

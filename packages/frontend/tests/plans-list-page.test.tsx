import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PlansListPage } from '../src/pages/PlansListPage';

const mockFetchPlans = vi.fn();
const mockDeletePlan = vi.fn();

vi.mock('../src/context/PlansContext', () => ({
  usePlans: () => ({
    plans: [{
      id: 'p1',
      userId: 'u1',
      name: 'Coastal Trip',
      destination: 'Lisbon',
      startDate: '2026-06-01',
      endDate: '2026-06-07',
      budget: 2100,
      status: 'planning',
      durationDays: 7,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }],
    loading: false,
    error: null,
    fetchPlans: mockFetchPlans,
    createPlan: vi.fn(),
    updatePlan: vi.fn(),
    deletePlan: mockDeletePlan,
  }),
}));

function renderWithRoutes() {
  render(
    <MemoryRouter initialEntries={['/plans']}>
      <Routes>
        <Route path="/plans" element={<PlansListPage />} />
        <Route path="/plans/new" element={<h1>Create page</h1>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PlansListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays plans list', async () => {
    renderWithRoutes();

    await waitFor(() => {
      expect(mockFetchPlans).toHaveBeenCalled();
    });

    expect(screen.getByText('Coastal Trip')).toBeInTheDocument();
  });

  it('create button navigates to create page', () => {
    renderWithRoutes();

    fireEvent.click(screen.getByRole('button', { name: 'Create Plan' }));

    expect(screen.getByText('Create page')).toBeInTheDocument();
  });
});

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PlanFormPage } from '../src/pages/PlanFormPage';

const { mockCreatePlan, mockUpdatePlan, mockGetById } = vi.hoisted(() => ({
  mockCreatePlan: vi.fn(),
  mockUpdatePlan: vi.fn(),
  mockGetById: vi.fn(),
}));

vi.mock('../src/context/PlansContext', () => ({
  usePlans: () => ({
    loading: false,
    plans: [],
    error: null,
    fetchPlans: vi.fn(),
    createPlan: mockCreatePlan,
    updatePlan: mockUpdatePlan,
    deletePlan: vi.fn(),
  }),
}));

vi.mock('../src/services/plansService', () => ({
  plansService: {
    getById: mockGetById,
  },
}));

describe('PlanFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields for create', () => {
    render(
      <MemoryRouter initialEntries={['/plans/new']}>
        <Routes>
          <Route path="/plans/new" element={<PlanFormPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Destination *')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date *')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date *')).toBeInTheDocument();
    expect(screen.getByLabelText('Budget *')).toBeInTheDocument();
  });

  it('shows validation error for invalid date range', async () => {
    render(
      <MemoryRouter initialEntries={['/plans/new']}>
        <Routes>
          <Route path="/plans/new" element={<PlanFormPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Name *'), { target: { value: 'Trip' } });
    fireEvent.change(screen.getByLabelText('Destination *'), { target: { value: 'Rome' } });
    fireEvent.change(screen.getByLabelText('Start Date *'), { target: { value: '2026-08-10' } });
    fireEvent.change(screen.getByLabelText('End Date *'), { target: { value: '2026-08-01' } });
    fireEvent.change(screen.getByLabelText('Budget *'), { target: { value: '1000' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create Plan' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('end date must be after start date');
    });
  });

  it('successful create redirects to plans list', async () => {
    mockCreatePlan.mockResolvedValue({ id: 'p1' });

    render(
      <MemoryRouter initialEntries={['/plans/new']}>
        <Routes>
          <Route path="/plans/new" element={<PlanFormPage />} />
          <Route path="/plans" element={<h1>Plans list</h1>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Name *'), { target: { value: 'Trip' } });
    fireEvent.change(screen.getByLabelText('Destination *'), { target: { value: 'Rome' } });
    fireEvent.change(screen.getByLabelText('Start Date *'), { target: { value: '2026-08-01' } });
    fireEvent.change(screen.getByLabelText('End Date *'), { target: { value: '2026-08-10' } });
    fireEvent.change(screen.getByLabelText('Budget *'), { target: { value: '1000' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create Plan' }));

    await waitFor(() => {
      expect(screen.getByText('Plans list')).toBeInTheDocument();
    });
  });

  it('loads existing plan when editing', async () => {
    mockGetById.mockResolvedValue({
      id: 'p1',
      name: 'Saved trip',
      destination: 'Rome',
      startDate: '2026-08-01',
      endDate: '2026-08-10',
      budget: 1000,
      status: 'planning',
      description: 'Saved description',
    });

    render(
      <MemoryRouter initialEntries={['/plans/p1/edit']}>
        <Routes>
          <Route path="/plans/:id/edit" element={<PlanFormPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Saved trip')).toBeInTheDocument();
    });
  });
});

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlansProvider, usePlans } from '../src/context/PlansContext';

const { mockGetAll, mockCreate, mockUpdate, mockDelete } = vi.hoisted(() => ({
  mockGetAll: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock('../src/services/plansService', () => ({
  plansService: {
    getAll: mockGetAll,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
  },
}));

function Harness() {
  const { plans, loading, error, fetchPlans, createPlan, updatePlan, deletePlan } = usePlans();

  return (
    <div>
      <div data-testid="plans-count">{plans.length}</div>
      <div data-testid="loading">{loading ? 'loading' : 'idle'}</div>
      <div data-testid="error">{error || ''}</div>
      <button onClick={() => void fetchPlans().catch(() => undefined)}>fetch</button>
      <button
        onClick={() =>
          void createPlan({
            name: 'Trip',
            destination: 'Rome',
            startDate: '2026-08-01',
            endDate: '2026-08-07',
            budget: 3000,
          }).catch(() => undefined)
        }
      >
        create
      </button>
      <button onClick={() => void updatePlan('p1', { name: 'Updated' }).catch(() => undefined)}>
        update
      </button>
      <button onClick={() => void deletePlan('p1').catch(() => undefined)}>delete</button>
    </div>
  );
}

describe('PlansContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initial state has empty plans array', () => {
    render(
      <PlansProvider>
        <Harness />
      </PlansProvider>
    );

    expect(screen.getByTestId('plans-count')).toHaveTextContent('0');
    expect(screen.getByTestId('loading')).toHaveTextContent('idle');
  });

  it('fetchPlans updates plans state', async () => {
    mockGetAll.mockResolvedValue([{ id: 'p1', name: 'Trip' }]);

    render(
      <PlansProvider>
        <Harness />
      </PlansProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'fetch' }));

    await waitFor(() => {
      expect(screen.getByTestId('plans-count')).toHaveTextContent('1');
    });
  });

  it('createPlan adds plan to state', async () => {
    mockCreate.mockResolvedValue({ id: 'p1', name: 'Trip' });

    render(
      <PlansProvider>
        <Harness />
      </PlansProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'create' }));

    await waitFor(() => {
      expect(screen.getByTestId('plans-count')).toHaveTextContent('1');
    });
  });

  it('updatePlan updates plan in state', async () => {
    mockCreate.mockResolvedValue({ id: 'p1', name: 'Trip' });
    mockUpdate.mockResolvedValue({ id: 'p1', name: 'Updated' });

    render(
      <PlansProvider>
        <Harness />
      </PlansProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'create' }));
    await waitFor(() => {
      expect(screen.getByTestId('plans-count')).toHaveTextContent('1');
    });

    fireEvent.click(screen.getByRole('button', { name: 'update' }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith('p1', { name: 'Updated' });
    });
  });

  it('deletePlan removes plan from state', async () => {
    mockCreate.mockResolvedValue({ id: 'p1', name: 'Trip' });
    mockDelete.mockResolvedValue(undefined);

    render(
      <PlansProvider>
        <Harness />
      </PlansProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'create' }));
    await waitFor(() => {
      expect(screen.getByTestId('plans-count')).toHaveTextContent('1');
    });

    fireEvent.click(screen.getByRole('button', { name: 'delete' }));

    await waitFor(() => {
      expect(screen.getByTestId('plans-count')).toHaveTextContent('0');
    });
  });

  it('sets loading and error state on failures', async () => {
    mockGetAll.mockRejectedValue(new Error('fetch failed'));

    render(
      <PlansProvider>
        <Harness />
      </PlansProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'fetch' }));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('fetch failed');
      expect(screen.getByTestId('loading')).toHaveTextContent('idle');
    });
  });
});

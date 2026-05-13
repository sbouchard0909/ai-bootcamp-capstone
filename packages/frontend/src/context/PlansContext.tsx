/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from 'react';
import { plansService } from '../services/plansService';
import { CreatePlanData, UpdatePlanData, VacationPlan } from '../types/plans';

interface PlansContextType {
  plans: VacationPlan[];
  loading: boolean;
  error: string | null;
  fetchPlans: () => Promise<void>;
  createPlan: (data: CreatePlanData) => Promise<VacationPlan>;
  updatePlan: (id: string, data: UpdatePlanData) => Promise<VacationPlan>;
  deletePlan: (id: string) => Promise<void>;
}

const PlansContext = createContext<PlansContextType | undefined>(undefined);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong while managing plans';
}

export function PlansProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState<VacationPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedPlans = await plansService.getAll();
      setPlans(fetchedPlans);
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPlan = useCallback(async (data: CreatePlanData) => {
    setLoading(true);
    setError(null);

    try {
      const created = await plansService.create(data);
      setPlans((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePlan = useCallback(async (id: string, data: UpdatePlanData) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await plansService.update(id, data);
      setPlans((prev) => prev.map((plan) => (plan.id === id ? updated : plan)));
      return updated;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePlan = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await plansService.delete(id);
      setPlans((prev) => prev.filter((plan) => plan.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value: PlansContextType = {
    plans,
    loading,
    error,
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
  };

  return <PlansContext.Provider value={value}>{children}</PlansContext.Provider>;
}

export function usePlans() {
  const context = useContext(PlansContext);
  if (!context) {
    throw new Error('usePlans must be used within a PlansProvider');
  }
  return context;
}

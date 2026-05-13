/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { activitiesService } from '../services/activitiesService';
import { Activity, CreateActivityData, UpdateActivityData } from '../types/activities';

interface ActivitiesContextType {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  totalCost: number;
  fetchActivities: () => Promise<void>;
  createActivity: (data: CreateActivityData) => Promise<Activity>;
  updateActivity: (id: string, data: UpdateActivityData) => Promise<Activity>;
  deleteActivity: (id: string) => Promise<void>;
}

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(undefined);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong while managing activities';
}

export function ActivitiesProvider({ planId, children }: { planId: string; children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCost = useMemo(() => {
    return activities.reduce((sum, activity) => sum + activity.cost, 0);
  }, [activities]);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedActivities = await activitiesService.getAll(planId);
      setActivities(fetchedActivities);
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [planId]);

  const createActivity = useCallback(async (data: CreateActivityData) => {
    setLoading(true);
    setError(null);

    try {
      const created = await activitiesService.create(planId, data);
      setActivities((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [planId]);

  const updateActivity = useCallback(async (id: string, data: UpdateActivityData) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await activitiesService.update(planId, id, data);
      setActivities((prev) => prev.map((activity) => (activity.id === id ? updated : activity)));
      return updated;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [planId]);

  const deleteActivity = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await activitiesService.delete(planId, id);
      setActivities((prev) => prev.filter((activity) => activity.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [planId]);

  const value = useMemo(
    () => ({
      activities,
      loading,
      error,
      totalCost,
      fetchActivities,
      createActivity,
      updateActivity,
      deleteActivity,
    }),
    [activities, loading, error, totalCost, fetchActivities, createActivity, updateActivity, deleteActivity]
  );

  return <ActivitiesContext.Provider value={value}>{children}</ActivitiesContext.Provider>;
}

export function useActivities() {
  const context = useContext(ActivitiesContext);
  if (context === undefined) {
    throw new Error('useActivities must be used within an ActivitiesProvider');
  }
  return context;
}

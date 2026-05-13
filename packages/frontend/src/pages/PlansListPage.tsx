import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { PlanCard } from '../components/PlanCard';
import { usePlans } from '../context/PlansContext';
import { VacationPlan } from '../types/plans';

export function PlansListPage() {
  const navigate = useNavigate();
  const { plans, loading, error, fetchPlans, deletePlan } = usePlans();
  const [pendingDelete, setPendingDelete] = useState<VacationPlan | null>(null);

  useEffect(() => {
    void fetchPlans();
  }, [fetchPlans]);

  const onConfirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    await deletePlan(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Vacation Plans</h1>
          <p className="text-gray-600">Track and manage all your trips</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/plans/new')}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Create Plan
        </button>
      </div>

      {loading && <p>Loading plans...</p>}
      {error && <p role="alert" className="text-red-600">{error}</p>}

      {!loading && !error && plans.length === 0 && (
        <div className="border border-dashed rounded-lg p-8 text-center text-gray-700 bg-white">
          You have no vacation plans yet.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onView={(id) => navigate(`/plans/${id}`)}
            onEdit={(id) => navigate(`/plans/${id}/edit`)}
            onDelete={(selected) => setPendingDelete(selected)}
          />
        ))}
      </div>

      <DeleteConfirmationDialog
        open={Boolean(pendingDelete)}
        planName={pendingDelete?.name || ''}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          void onConfirmDelete();
        }}
      />
    </div>
  );
}

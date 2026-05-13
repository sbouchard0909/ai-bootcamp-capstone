import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ActivitiesList } from '../components/ActivitiesList';
import { ActivityFormModal } from '../components/ActivityFormModal';
import { BudgetOverview } from '../components/BudgetOverview';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { ActivitiesProvider, useActivities } from '../context/ActivitiesContext';
import { usePlans } from '../context/PlansContext';
import { budgetService } from '../services/budgetService';
import { plansService } from '../services/plansService';
import { Activity, CreateActivityData, UpdateActivityData } from '../types/activities';
import { BudgetDetails, VacationPlan } from '../types/plans';

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function PlanDetailsPage() {
  const { id } = useParams();

  const [plan, setPlan] = useState<VacationPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Plan not found');
      setLoading(false);
      return;
    }

    const loadPlan = async () => {
      setLoading(true);
      setError('');

      try {
        const fetched = await plansService.getById(id);
        setPlan(fetched);
      } catch (_err) {
        setError('Unable to load plan details');
      } finally {
        setLoading(false);
      }
    };

    void loadPlan();
  }, [id]);

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6">Loading plan...</div>;
  }

  if (error || !plan) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p role="alert" className="text-red-600">{error || 'Plan not found'}</p>
        <Link to="/plans" className="text-blue-600">Back to plans</Link>
      </div>
    );
  }

  return (
    <ActivitiesProvider planId={plan.id}>
      <PlanDetailsContent plan={plan} />
    </ActivitiesProvider>
  );
}

function PlanDetailsContent({ plan }: { plan: VacationPlan }) {
  const navigate = useNavigate();
  const { deletePlan } = usePlans();
  const { activities, totalCost, fetchActivities, createActivity, updateActivity, deleteActivity } = useActivities();

  const [showDeletePlanConfirm, setShowDeletePlanConfirm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);
  const [budgetDetails, setBudgetDetails] = useState<BudgetDetails | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [alertDismissed, setAlertDismissed] = useState(false);

  useEffect(() => {
    void fetchActivities();
  }, [fetchActivities]);

  const fallbackBudget = useMemo<BudgetDetails>(
    () => ({
      totalBudget: plan.budget,
      totalSpent: totalCost,
      remainingBudget: plan.budget - totalCost,
      budgetUtilization: plan.budget > 0 ? Number(((totalCost / plan.budget) * 100).toFixed(2)) : 0,
      costByCategory: {},
      costByDate: {},
      warnings: [],
      isOverBudget: plan.budget - totalCost < 0,
    }),
    [plan.budget, totalCost]
  );

  const loadBudget = useCallback(async () => {
    try {
      const details = await budgetService.getBudgetDetails(plan.id);
      setBudgetDetails(details);
      setBudgetError(null);
      setAlertDismissed(false);
    } catch (_error) {
      setBudgetError('Unable to load detailed budget insights');
    }
  }, [plan.id]);

  useEffect(() => {
    void loadBudget();
  }, [loadBudget, activities]);

  const activeBudget = budgetDetails ?? fallbackBudget;

  const handleDeletePlan = async () => {
    await deletePlan(plan.id);
    navigate('/plans');
  };

  const handleActivitySubmit = async (data: CreateActivityData | UpdateActivityData) => {
    if (editingActivity) {
      await updateActivity(editingActivity.id, data as UpdateActivityData);
    } else {
      await createActivity(data as CreateActivityData);
    }
    setShowActivityForm(false);
    setEditingActivity(null);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setShowActivityForm(true);
  };

  const handleDeleteActivity = async () => {
    if (!deletingActivity) return;
    await deleteActivity(deletingActivity.id);
    setDeletingActivity(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link to="/plans" className="text-blue-600">Back to plans</Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{plan.name}</h1>
            <p className="text-gray-600 mt-1">{plan.destination}</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-800">
            {plan.status}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <dt className="text-gray-500 text-sm">Dates</dt>
            <dd>{formatDate(plan.startDate)} - {formatDate(plan.endDate)}</dd>
          </div>
          <div>
            <dt className="text-gray-500 text-sm">Duration</dt>
            <dd>{plan.durationDays ?? '--'} days</dd>
          </div>
          <div>
            <dt className="text-gray-500 text-sm">Budget</dt>
            <dd>{formatCurrency(plan.budget)}</dd>
          </div>
        </dl>

        {plan.description && (
          <div className="mt-6">
            <h2 className="font-semibold">Description</h2>
            <p className="text-gray-700 mt-1">{plan.description}</p>
          </div>
        )}

        <BudgetOverview
          budget={activeBudget}
          alertDismissed={alertDismissed}
          onDismissAlert={() => setAlertDismissed(true)}
        />

        {budgetError && <p className="mt-3 text-sm text-amber-700">{budgetError}</p>}

        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Activities</h2>
            <button
              type="button"
              onClick={() => { setEditingActivity(null); setShowActivityForm(true); }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Add Activity
            </button>
          </div>
          <ActivitiesList
            activities={activities}
            onEdit={handleEditActivity}
            onDelete={(activity) => setDeletingActivity(activity)}
          />
        </div>

        <div className="mt-6 flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/plans/${plan.id}/edit`)}
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setShowDeletePlanConfirm(true)}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      <DeleteConfirmationDialog
        open={showDeletePlanConfirm}
        planName={plan.name}
        onCancel={() => setShowDeletePlanConfirm(false)}
        onConfirm={() => {
          void handleDeletePlan();
        }}
      />

      {deletingActivity && (
        <DeleteConfirmationDialog
          open={true}
          planName={deletingActivity.name}
          onCancel={() => setDeletingActivity(null)}
          onConfirm={() => {
            void handleDeleteActivity();
          }}
        />
      )}

      {showActivityForm && (
        <ActivityFormModal
          activity={editingActivity ?? undefined}
          planStartDate={plan.startDate}
          planEndDate={plan.endDate}
          remainingBudget={activeBudget.remainingBudget}
          currentActivityCost={editingActivity?.cost}
          onSubmit={handleActivitySubmit}
          onCancel={() => { setShowActivityForm(false); setEditingActivity(null); }}
        />
      )}
    </div>
  );
}

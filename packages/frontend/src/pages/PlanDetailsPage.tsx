import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { usePlans } from '../context/PlansContext';
import { plansService } from '../services/plansService';
import { VacationPlan } from '../types/plans';

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
  const navigate = useNavigate();
  const { deletePlan } = usePlans();

  const [plan, setPlan] = useState<VacationPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const onDelete = async () => {
    if (!plan) {
      return;
    }

    await deletePlan(plan.id);
    navigate('/plans');
  };

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

        <div className="mt-6 pt-6 border-t">
          <h2 className="font-semibold">Activities</h2>
          <p className="text-gray-600 mt-1">Activity management is coming in a later step.</p>
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
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      <DeleteConfirmationDialog
        open={showDeleteConfirm}
        planName={plan.name}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          void onDelete();
        }}
      />
    </div>
  );
}

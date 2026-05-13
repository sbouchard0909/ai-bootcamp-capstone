import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePlans } from '../context/PlansContext';
import { plansService } from '../services/plansService';
import { PLAN_STATUSES, PlanStatus } from '../types/plans';

interface PlanFormState {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  description: string;
  status: PlanStatus;
}

function initialFormState(): PlanFormState {
  return {
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    description: '',
    status: 'planning',
  };
}

function validateForm(state: PlanFormState): string | null {
  if (!state.name || !state.destination || !state.startDate || !state.endDate || !state.budget) {
    return 'name, destination, dates and budget are required';
  }

  if (state.name.length > 200) {
    return 'name must be 200 characters or fewer';
  }

  if (state.endDate < state.startDate) {
    return 'end date must be after start date';
  }

  const budgetNumber = Number(state.budget);
  if (Number.isNaN(budgetNumber) || budgetNumber <= 0) {
    return 'budget must be a positive number';
  }

  return null;
}

export function PlanFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createPlan, updatePlan, loading } = usePlans();

  const isEdit = Boolean(id);
  const [form, setForm] = useState<PlanFormState>(initialFormState);
  const [initializing, setInitializing] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit || !id) {
      return;
    }

    const loadPlan = async () => {
      setInitializing(true);
      setError('');

      try {
        const plan = await plansService.getById(id);
        setForm({
          name: plan.name,
          destination: plan.destination,
          startDate: plan.startDate,
          endDate: plan.endDate,
          budget: String(plan.budget),
          description: plan.description || '',
          status: plan.status,
        });
      } catch (_err) {
        setError('Unable to load plan details');
      } finally {
        setInitializing(false);
      }
    };

    void loadPlan();
  }, [id, isEdit]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');

    try {
      if (isEdit && id) {
        await updatePlan(id, {
          name: form.name,
          destination: form.destination,
          startDate: form.startDate,
          endDate: form.endDate,
          budget: Number(form.budget),
          description: form.description,
          status: form.status,
        });
        navigate(`/plans/${id}`);
        return;
      }

      await createPlan({
        name: form.name,
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
        budget: Number(form.budget),
        description: form.description,
        status: form.status,
      });
      navigate('/plans');
    } catch (_err) {
      setError('Unable to save plan with provided details');
    }
  };

  if (initializing) {
    return <div className="max-w-3xl mx-auto p-6">Loading plan...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{isEdit ? 'Edit Plan' : 'Create Plan'}</h1>

      {error && <p role="alert" className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={onSubmit} noValidate className="bg-white rounded-lg shadow p-6">
        <label htmlFor="name" className="block mb-2">Name *</label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          className="w-full border rounded p-2 mb-4"
        />

        <label htmlFor="destination" className="block mb-2">Destination *</label>
        <input
          id="destination"
          name="destination"
          value={form.destination}
          onChange={(event) => setForm((prev) => ({ ...prev, destination: event.target.value }))}
          className="w-full border rounded p-2 mb-4"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block mb-2">Start Date *</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
              className="w-full border rounded p-2 mb-4"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block mb-2">End Date *</label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
              className="w-full border rounded p-2 mb-4"
            />
          </div>
        </div>

        <label htmlFor="budget" className="block mb-2">Budget *</label>
        <input
          id="budget"
          name="budget"
          type="number"
          min="1"
          value={form.budget}
          onChange={(event) => setForm((prev) => ({ ...prev, budget: event.target.value }))}
          className="w-full border rounded p-2 mb-4"
        />

        <label htmlFor="status" className="block mb-2">Status</label>
        <select
          id="status"
          name="status"
          value={form.status}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, status: event.target.value as PlanStatus }))
          }
          className="w-full border rounded p-2 mb-4"
        >
          {PLAN_STATUSES.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <label htmlFor="description" className="block mb-2">Description</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          className="w-full border rounded p-2 mb-6"
        />

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Plan'}
          </button>
          <Link
            to={isEdit && id ? `/plans/${id}` : '/plans'}
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

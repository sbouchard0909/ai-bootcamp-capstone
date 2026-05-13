import { MouseEvent } from 'react';
import { VacationPlan } from '../types/plans';

interface PlanCardProps {
  plan: VacationPlan;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (plan: VacationPlan) => void;
}

const STATUS_CLASS_MAP: Record<VacationPlan['status'], string> = {
  planning: 'bg-slate-200 text-slate-800',
  upcoming: 'bg-blue-200 text-blue-900',
  active: 'bg-emerald-200 text-emerald-900',
  completed: 'bg-green-200 text-green-900',
  cancelled: 'bg-red-200 text-red-900',
};

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
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

export function PlanCard({ plan, onView, onEdit, onDelete }: PlanCardProps) {
  const onCardClick = () => onView(plan.id);

  const stopClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <article
      className="border rounded-lg p-4 bg-white shadow-sm hover:shadow cursor-pointer"
      onClick={onCardClick}
      aria-label={`View plan ${plan.name}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{plan.name}</h2>
          <p className="text-gray-600">{plan.destination}</p>
        </div>

        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_CLASS_MAP[plan.status]}`}>
          {plan.status}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-gray-500">Dates</dt>
          <dd>{formatDate(plan.startDate)} - {formatDate(plan.endDate)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Duration</dt>
          <dd>{plan.durationDays ?? '--'} days</dd>
        </div>
        <div>
          <dt className="text-gray-500">Budget</dt>
          <dd>{formatCurrency(plan.budget)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={(event) => {
            stopClick(event);
            onEdit(plan.id);
          }}
          className="px-3 py-1.5 text-sm rounded bg-gray-100 hover:bg-gray-200"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={(event) => {
            stopClick(event);
            onDelete(plan);
          }}
          className="px-3 py-1.5 text-sm rounded bg-red-100 text-red-700 hover:bg-red-200"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

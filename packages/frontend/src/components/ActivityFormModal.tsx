import { FormEvent, useState } from 'react';
import { Activity, ActivityCategory, ACTIVITY_CATEGORIES, CreateActivityData, UpdateActivityData } from '../types/activities';

interface ActivityFormModalProps {
  activity?: Activity;
  planStartDate: string;
  planEndDate: string;
  remainingBudget?: number;
  currentActivityCost?: number;
  onSubmit: (data: CreateActivityData | UpdateActivityData) => Promise<void>;
  onCancel: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function ActivityFormModal({
  activity,
  planStartDate,
  planEndDate,
  remainingBudget,
  currentActivityCost,
  onSubmit,
  onCancel,
}: ActivityFormModalProps) {
  const [name, setName] = useState(activity?.name || '');
  const [date, setDate] = useState(activity?.date || '');
  const [startTime, setStartTime] = useState(activity?.startTime || '');
  const [endTime, setEndTime] = useState(activity?.endTime || '');
  const [cost, setCost] = useState<number | ''>(activity?.cost ?? '');
  const [category, setCategory] = useState<ActivityCategory>(activity?.category || 'dining');
  const [location, setLocation] = useState(activity?.location || '');
  const [description, setDescription] = useState(activity?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation
  const nameError = name.trim() === '' ? 'Name is required' : null;
  const costNum = cost === '' ? 0 : cost;
  const costError = costNum < 0 ? 'Cost cannot be negative' : null;
  const timeError = startTime && endTime && endTime <= startTime ? 'End time must be after start time' : null;

  const hasErrors = Boolean(nameError || costError || timeError);
  const canSubmit = name.trim() !== '' && !hasErrors;

  const currentRemaining = remainingBudget ?? null;
  const editCredit = activity ? (currentActivityCost ?? activity.cost ?? 0) : 0;
  const projectedRemaining =
    currentRemaining === null
      ? null
      : Number((currentRemaining + editCredit - costNum).toFixed(2));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const data: CreateActivityData | UpdateActivityData = {
        name: name.trim(),
        date,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        cost: cost === '' ? 0 : cost,
        category,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
      };
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">{activity ? 'Edit Activity' : 'Add Activity'}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={planStartDate}
                  max={planEndDate}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                >
                  {Object.entries(ACTIVITY_CATEGORIES).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
                {timeError && <p className="text-red-600 text-sm mt-1">{timeError}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                  Cost * ($)
                </label>
                <input
                  type="number"
                  id="cost"
                  value={cost}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setCost('');
                    } else {
                      const parsed = parseFloat(val);
                      setCost(isNaN(parsed) ? '' : parsed);
                    }
                  }}
                  step="0.01"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
                {costError && <p className="text-red-600 text-sm mt-1">{costError}</p>}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>

            {currentRemaining !== null && (
              <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm">
                <p>Current remaining budget: <span className="font-medium">{formatCurrency(currentRemaining)}</span></p>
                {projectedRemaining !== null && (
                  <p>
                    Remaining after this activity:{' '}
                    <span className={`font-medium ${projectedRemaining < 0 ? 'text-red-600' : ''}`}>
                      {formatCurrency(projectedRemaining)}
                    </span>
                  </p>
                )}
                {projectedRemaining !== null && projectedRemaining < 0 && (
                  <p role="alert" className="text-red-600 mt-1">
                    This activity will exceed your budget by {formatCurrency(Math.abs(projectedRemaining))}.
                  </p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

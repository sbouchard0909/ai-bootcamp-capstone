import { Activity, ACTIVITY_CATEGORIES } from '../types/activities';

interface ActivityCardProps {
  activity: Activity;
  onEdit: () => void;
  onDelete: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTime(time?: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function ActivityCard({ activity, onEdit, onDelete }: ActivityCardProps) {
  const categoryConfig = ACTIVITY_CATEGORIES[activity.category];
  const timeRange = activity.startTime
    ? `${formatTime(activity.startTime)}${activity.endTime ? ` – ${formatTime(activity.endTime)}` : ''}`
    : '';

  return (
    <article className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-md font-semibold">{activity.name}</h3>
          {timeRange && <p className="text-sm text-gray-500">{timeRange}</p>}
        </div>

        <span className={`text-xs px-2 py-1 rounded-full font-medium bg-${categoryConfig.color}-100 text-${categoryConfig.color}-800 flex items-center gap-1`}>
          <span>{categoryConfig.icon}</span>
          <span>{categoryConfig.label}</span>
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-gray-500">Cost</dt>
          <dd className="font-medium">{formatCurrency(activity.cost)}</dd>
        </div>
        {activity.location && (
          <div>
            <dt className="text-gray-500">Location</dt>
            <dd>{activity.location}</dd>
          </div>
        )}
      </div>

      {activity.description && (
        <p className="mt-3 text-sm text-gray-600">{activity.description}</p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="text-sm text-blue-600 hover:text-blue-800"
          aria-label={`Edit ${activity.name}`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-sm text-red-600 hover:text-red-800"
          aria-label={`Delete ${activity.name}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

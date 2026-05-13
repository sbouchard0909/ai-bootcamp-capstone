import { Activity } from '../types/activities';
import { ActivityCard } from './ActivityCard';

interface ActivitiesListProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
}

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

function groupByDate(activities: Activity[]): Map<string, Activity[]> {
  const grouped = new Map<string, Activity[]>();
  
  // Sort all activities by date and time
  const sorted = [...activities].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    
    // Sort by startTime within same date (no time = end of day)
    const aTime = a.startTime || '23:59';
    const bTime = b.startTime || '23:59';
    return aTime.localeCompare(bTime);
  });

  // Group by date
  for (const activity of sorted) {
    const existing = grouped.get(activity.date) || [];
    grouped.set(activity.date, [...existing, activity]);
  }

  return grouped;
}

export function ActivitiesList({ activities, onEdit, onDelete }: ActivitiesListProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No activities yet. Add your first activity to get started!</p>
      </div>
    );
  }

  const groupedActivities = groupByDate(activities);

  return (
    <div className="space-y-6">
      {Array.from(groupedActivities.entries()).map(([date, dateActivities]) => {
        const dailyTotal = dateActivities.reduce((sum, activity) => sum + activity.cost, 0);
        
        return (
          <div key={date}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">{formatDate(date)}</h3>
              <span className="text-sm text-gray-600">Total: {formatCurrency(dailyTotal)}</span>
            </div>
            <div className="space-y-3">
              {dateActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onEdit={() => onEdit(activity)}
                  onDelete={() => onDelete(activity)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { ACTIVITY_CATEGORIES, ActivityCategory } from '../types/activities';
import { BudgetDetails } from '../types/plans';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function getUtilizationColor(utilization: number): {
  barClass: string;
  textClass: string;
  label: string;
} {
  if (utilization > 100) {
    return {
      barClass: 'bg-red-500',
      textClass: 'text-red-700',
      label: 'Over Budget',
    };
  }

  if (utilization >= 75) {
    return {
      barClass: 'bg-amber-500',
      textClass: 'text-amber-700',
      label: 'Near Limit',
    };
  }

  return {
    barClass: 'bg-emerald-500',
    textClass: 'text-emerald-700',
    label: 'On Track',
  };
}

interface BudgetOverviewProps {
  budget: BudgetDetails;
  alertDismissed: boolean;
  onDismissAlert: () => void;
}

export function BudgetOverview({ budget, alertDismissed, onDismissAlert }: BudgetOverviewProps) {
  const utilization = Math.max(0, budget.budgetUtilization);
  const progressWidth = Math.min(utilization, 100);
  const utilizationStyle = getUtilizationColor(utilization);

  const entries = Object.keys(ACTIVITY_CATEGORIES).map((category) => {
    const key = category as ActivityCategory;
    const spent = budget.costByCategory[key] ?? 0;
    const percentOfBudget = budget.totalBudget > 0 ? (spent / budget.totalBudget) * 100 : 0;

    return {
      key,
      label: ACTIVITY_CATEGORIES[key].label,
      icon: ACTIVITY_CATEGORIES[key].icon,
      spent,
      percentOfBudget,
    };
  });

  const maxCategorySpend = entries.reduce((max, entry) => Math.max(max, entry.spent), 0);

  const timelineEntries = Object.entries(budget.costByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }));

  const cumulativeTimeline = timelineEntries.map((entry, index) => {
    const cumulative = timelineEntries
      .slice(0, index + 1)
      .reduce((sum, timelineEntry) => sum + timelineEntry.amount, 0);

    return {
      date: entry.date,
      cumulative,
    };
  });

  const maxTimelineValue = cumulativeTimeline.reduce((max, item) => Math.max(max, item.cumulative), 0);

  return (
    <section className="mt-6 pt-6 border-t" aria-label="Budget overview section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Budget Overview</h2>
        {utilization > 100 && (
          <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium">
            Over Budget
          </span>
        )}
      </div>

      {!alertDismissed && utilization >= 90 && (
        <div
          role="alert"
          className={`mb-4 rounded-md border px-4 py-3 ${utilization > 100
            ? 'border-red-200 bg-red-50 text-red-800'
            : 'border-amber-200 bg-amber-50 text-amber-800'}`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium">
              {utilization > 100
                ? 'You are over budget. Consider reducing upcoming activity costs.'
                : 'You are nearing your budget limit.'}
            </p>
            <button
              type="button"
              onClick={onDismissAlert}
              className="text-xs underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <dt className="text-gray-500 text-sm">Total Budget</dt>
          <dd>{formatCurrency(budget.totalBudget)}</dd>
        </div>
        <div>
          <dt className="text-gray-500 text-sm">Total Spent</dt>
          <dd>{formatCurrency(budget.totalSpent)}</dd>
        </div>
        <div>
          <dt className="text-gray-500 text-sm">Remaining Budget</dt>
          <dd className={budget.remainingBudget < 0 ? 'text-red-600 font-semibold' : ''}>
            {formatCurrency(budget.remainingBudget)}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Budget Utilization</span>
          <span data-testid="budget-utilization" className={utilizationStyle.textClass}>
            {utilization.toFixed(0)}%
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(utilization, 100)}>
          <div
            data-testid="budget-progress-fill"
            className={`h-full ${utilizationStyle.barClass} transition-all duration-500 ease-out`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
        <p className={`mt-2 text-xs ${utilizationStyle.textClass}`}>{utilizationStyle.label}</p>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h3 className="font-semibold mb-3">Budget Breakdown</h3>
          <div role="img" aria-label="Budget breakdown chart" className="space-y-2">
            {entries.map((entry) => (
              <div key={entry.key}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{entry.icon} {entry.label}</span>
                  <span>{formatCurrency(entry.spent)}</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500"
                    style={{ width: `${maxCategorySpend === 0 ? 0 : (entry.spent / maxCategorySpend) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2">Category</th>
                  <th className="py-2">Spent</th>
                  <th className="py-2">% of Budget</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={`row-${entry.key}`} className="border-b last:border-0">
                    <td className="py-2">{entry.icon} {entry.label}</td>
                    <td className="py-2">{formatCurrency(entry.spent)}</td>
                    <td className="py-2">{entry.percentOfBudget.toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-3">Spending Timeline</h3>
          <div role="img" aria-label="Spending timeline chart" className="border rounded p-3">
            {cumulativeTimeline.length === 0 ? (
              <p className="text-sm text-gray-500">No spending data yet.</p>
            ) : (
              <div className="space-y-2">
                {cumulativeTimeline.map((item) => (
                  <div key={item.date} className="flex items-center gap-3">
                    <span className="text-xs w-24 text-gray-500">{item.date}</span>
                    <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.cumulative > budget.totalBudget ? 'bg-red-500' : 'bg-indigo-500'}`}
                        style={{ width: `${maxTimelineValue === 0 ? 0 : (item.cumulative / maxTimelineValue) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs w-16 text-right">{formatCurrency(item.cumulative)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

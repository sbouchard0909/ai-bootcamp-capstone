import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { DashboardData, VacationPlan } from '../types/plans';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function StatisticCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description?: string;
}) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      {description && <div className="text-xs text-gray-500">{description}</div>}
    </div>
  );
}

function TripCard({ plan }: { plan: VacationPlan }) {
  return (
    <Link
      to={`/plans/${plan.id}`}
      aria-label={`View plan ${plan.name}`}
      className="block bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
    >
      <h3 className="font-semibold text-lg text-gray-900 mb-2">{plan.name}</h3>
      <p className="text-gray-600 mb-2">{plan.destination}</p>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
        </span>
        {plan.durationDays && <span>{plan.durationDays} days</span>}
      </div>
      {plan.budget && (
        <div className="mt-2 text-sm">
          <span className="text-gray-600">Budget: {formatCurrency(plan.budget)}</span>
          {plan.totalSpent !== undefined && (
            <span className="text-gray-500 ml-2">
              (Spent: {formatCurrency(plan.totalSpent)})
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { upcomingPlans, activePlans, completedPlans, statistics } = dashboardData;
  const hasPlans = statistics.totalPlans > 0;
  const hasUpcoming = upcomingPlans.length > 0;
  const activeTrip = activePlans[0];

  // Empty state - no plans at all
  if (!hasPlans) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome, {user?.name || 'User'}.</p>

        <div className="max-w-2xl mx-auto text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            No vacation plans yet
          </h2>
          <p className="text-gray-600 mb-8">
            Start planning your dream vacation! Create your first plan to get started.
          </p>
          <button
            type="button"
            onClick={() => navigate('/plans/new')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create your first plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome, {user?.name || 'User'}.</p>

      {/* Active Trip Banner */}
      {activeTrip && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                  Active
                </span>
                <h2 className="text-xl font-bold text-gray-900">{activeTrip.name}</h2>
              </div>
              <p className="text-gray-700 mb-2">{activeTrip.destination}</p>
              <div className="text-sm text-gray-600">
                <span>
                  {formatDate(activeTrip.startDate)} - {formatDate(activeTrip.endDate)}
                </span>
                {activeTrip.durationDays && <span className="ml-4">{activeTrip.durationDays} days</span>}
              </div>
            </div>
            <Link
              to={`/plans/${activeTrip.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              View Details
            </Link>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatisticCard
          label="Total Plans"
          value={statistics.totalPlans}
          description="All vacation plans"
        />
        <StatisticCard
          label="Total Budget"
          value={formatCurrency(statistics.totalBudget)}
          description="Across all plans"
        />
        <StatisticCard
          label="Total Spent"
          value={formatCurrency(statistics.totalSpent)}
          description="All activities"
        />
        <StatisticCard
          label="Upcoming Trips"
          value={upcomingPlans.length}
          description="Plans to look forward to"
        />
        {activePlans.length > 0 && (
          <StatisticCard
            label="Active Trips"
            value={activePlans.length}
            description="Currently happening"
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => navigate('/plans/new')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create New Plan
        </button>
        <Link
          to="/plans"
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          View All Plans
        </Link>
      </div>

      {/* Upcoming Trips Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Upcoming Trips</h2>
        {hasUpcoming ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingPlans.slice(0, 6).map((plan) => (
              <TripCard key={plan.id} plan={plan} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">No upcoming trips scheduled.</p>
            <button
              type="button"
              onClick={() => navigate('/plans/new')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Plan a Trip
            </button>
          </div>
        )}
      </div>

      {/* Recent Completed Trips (if any) */}
      {completedPlans.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Trips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedPlans.slice(0, 3).map((plan) => (
              <TripCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

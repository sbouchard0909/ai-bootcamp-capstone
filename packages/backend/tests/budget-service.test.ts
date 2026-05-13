import fs from 'fs';
import path from 'path';
import { createActivity } from '../src/utils/activityDb';
import { closeDatabase, initializeDatabase } from '../src/utils/database';
import { createVacationPlan } from '../src/utils/planDb';
import {
  buildBudgetSummary,
  getCostByCategory,
  getCostByDate,
  getMostExpensiveActivities,
  getTotalSpent,
  isOverBudget,
} from '../src/utils/budgetService';
import { createUser } from '../src/utils/userDb';

function isoDateFromNow(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

describe('budgetService', () => {
  const testDbPath = path.join(__dirname, '../test-budget-service.db');

  beforeEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    initializeDatabase(testDbPath);
  });

  afterEach(() => {
    closeDatabase();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it('getTotalSpent returns sum of activity costs', () => {
    const user = createUser({ email: 'budget-total@example.com', password: 'password123', name: 'Budget User' });
    const plan = createVacationPlan({
      userId: user.id,
      name: 'Total Plan',
      destination: 'Quebec City',
      startDate: isoDateFromNow(5),
      endDate: isoDateFromNow(7),
      budget: 1000,
    });

    createActivity({ planId: plan.id, name: 'One', date: isoDateFromNow(5), cost: 50, category: 'other' });
    createActivity({ planId: plan.id, name: 'Two', date: isoDateFromNow(6), cost: 125, category: 'dining' });

    expect(getTotalSpent(plan.id)).toBe(175);
  });

  it('getTotalSpent returns 0 when no activities exist', () => {
    const user = createUser({ email: 'budget-empty@example.com', password: 'password123', name: 'Budget User' });
    const plan = createVacationPlan({
      userId: user.id,
      name: 'No Activity Plan',
      destination: 'Quebec City',
      startDate: isoDateFromNow(5),
      endDate: isoDateFromNow(7),
      budget: 1000,
    });

    expect(getTotalSpent(plan.id)).toBe(0);
  });

  it('buildBudgetSummary calculates remaining budget and utilization', () => {
    const user = createUser({ email: 'budget-summary@example.com', password: 'password123', name: 'Budget User' });
    const plan = createVacationPlan({
      userId: user.id,
      name: 'Summary Plan',
      destination: 'Quebec City',
      startDate: isoDateFromNow(5),
      endDate: isoDateFromNow(7),
      budget: 100,
    });

    createActivity({ planId: plan.id, name: 'Over', date: isoDateFromNow(5), cost: 125, category: 'other' });

    const summary = buildBudgetSummary(plan.id, plan.budget);

    expect(summary.totalSpent).toBe(125);
    expect(summary.remainingBudget).toBe(-25);
    expect(summary.budgetUtilization).toBe(125);
    expect(summary.warnings).toContain('Budget usage has reached 80% or more');
    expect(summary.warnings).toContain('Plan is over budget');
  });

  it('getCostByCategory groups totals by category', () => {
    const user = createUser({ email: 'budget-category@example.com', password: 'password123', name: 'Budget User' });
    const plan = createVacationPlan({
      userId: user.id,
      name: 'Category Plan',
      destination: 'Quebec City',
      startDate: isoDateFromNow(5),
      endDate: isoDateFromNow(7),
      budget: 500,
    });

    createActivity({ planId: plan.id, name: 'Dinner', date: isoDateFromNow(5), cost: 60, category: 'dining' });
    createActivity({ planId: plan.id, name: 'Lunch', date: isoDateFromNow(6), cost: 40, category: 'dining' });
    createActivity({ planId: plan.id, name: 'Taxi', date: isoDateFromNow(6), cost: 30, category: 'transport' });

    expect(getCostByCategory(plan.id)).toEqual({ dining: 100, transport: 30 });
  });

  it('getCostByDate groups totals by activity date', () => {
    const user = createUser({ email: 'budget-date@example.com', password: 'password123', name: 'Budget User' });
    const plan = createVacationPlan({
      userId: user.id,
      name: 'Date Plan',
      destination: 'Quebec City',
      startDate: isoDateFromNow(5),
      endDate: isoDateFromNow(7),
      budget: 500,
    });

    const day1 = isoDateFromNow(5);
    const day2 = isoDateFromNow(6);

    createActivity({ planId: plan.id, name: 'One', date: day1, cost: 25, category: 'other' });
    createActivity({ planId: plan.id, name: 'Two', date: day1, cost: 35, category: 'other' });
    createActivity({ planId: plan.id, name: 'Three', date: day2, cost: 40, category: 'other' });

    expect(getCostByDate(plan.id)).toEqual({ [day1]: 60, [day2]: 40 });
  });

  it('getMostExpensiveActivities returns highest-cost activities first', () => {
    const user = createUser({ email: 'budget-top@example.com', password: 'password123', name: 'Budget User' });
    const plan = createVacationPlan({
      userId: user.id,
      name: 'Top Cost Plan',
      destination: 'Quebec City',
      startDate: isoDateFromNow(5),
      endDate: isoDateFromNow(7),
      budget: 1000,
    });

    createActivity({ planId: plan.id, name: 'Low', date: isoDateFromNow(5), cost: 20, category: 'other' });
    createActivity({ planId: plan.id, name: 'High', date: isoDateFromNow(6), cost: 120, category: 'other' });
    createActivity({ planId: plan.id, name: 'Mid', date: isoDateFromNow(6), cost: 80, category: 'other' });

    const topTwo = getMostExpensiveActivities(plan.id, 2);

    expect(topTwo).toHaveLength(2);
    expect(topTwo[0].name).toBe('High');
    expect(topTwo[1].name).toBe('Mid');
  });

  it('isOverBudget returns true only when spent exceeds budget', () => {
    const user = createUser({ email: 'budget-over@example.com', password: 'password123', name: 'Budget User' });
    const plan = createVacationPlan({
      userId: user.id,
      name: 'Over Budget Check Plan',
      destination: 'Quebec City',
      startDate: isoDateFromNow(5),
      endDate: isoDateFromNow(7),
      budget: 100,
    });

    createActivity({ planId: plan.id, name: 'Expense', date: isoDateFromNow(5), cost: 90, category: 'other' });
    expect(isOverBudget(plan.id, plan.budget)).toBe(false);

    createActivity({ planId: plan.id, name: 'Another', date: isoDateFromNow(6), cost: 20, category: 'other' });
    expect(isOverBudget(plan.id, plan.budget)).toBe(true);
  });
});

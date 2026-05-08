# Step 9: Budget Tracking (Backend)

## Overview
Implement backend logic for budget tracking, spending calculations, and budget alerts across vacation plans and activities.

## Backend Tasks

### Budget Calculations
Add calculated fields to plan responses:
```typescript
interface VacationPlanWithBudget extends VacationPlan {
  totalSpent: number;        // Sum of all activity costs
  remainingBudget: number;   // budget - totalSpent
  budgetUtilization: number; // (totalSpent / budget) * 100
  costByCategory: {
    [category: string]: number;
  };
}
```

### Budget Service
Create utility service for calculations:
```typescript
// services/budgetService.ts
export const budgetService = {
  calculateTotalSpent(planId: string): Promise<number>,
  calculateRemainingBudget(planId: string): Promise<number>,
  getCostByCategory(planId: string): Promise<Record<string, number>>,
  isOverBudget(planId: string): Promise<boolean>,
};
```

### Enhanced Plan Endpoints
Update existing plan endpoints to include budget data:
- `GET /api/plans/:id` - Include budget calculations
- `GET /api/plans` - Include budget summary for each plan

### Budget Statistics Endpoint
Create new endpoint for detailed budget info:
- `GET /api/plans/:id/budget` - Get detailed budget breakdown
  - Total budget
  - Total spent
  - Remaining budget
  - Budget utilization percentage
  - Cost breakdown by category
  - Cost breakdown by date
  - Most expensive activities

### Budget Validation
- Warn (don't prevent) when activity cost exceeds remaining budget
- Include budget warning in create/update activity response
- Calculate impact of activity on budget before creation

### Database Queries
Optimize queries for budget calculations:
- Aggregate query for total activities cost
- Group by category for cost breakdown
- Index activities table for faster aggregations

## Testing Requirements

### Backend Tests (TDD - Write First!)

**Budget Calculations**
1. Test: calculateTotalSpent() returns sum of all activity costs
2. Test: calculateTotalSpent() returns 0 for plan with no activities
3. Test: calculateRemainingBudget() returns budget minus total spent
4. Test: calculateRemainingBudget() can be negative (over budget)
5. Test: budgetUtilization() calculates correct percentage
6. Test: getCostByCategory() groups costs correctly
7. Test: isOverBudget() returns true when spent exceeds budget
8. Test: isOverBudget() returns false when within budget

**Enhanced Plan Endpoints**
1. Test: GET /api/plans/:id includes budget calculations
2. Test: Budget data accurate with multiple activities
3. Test: Budget data correct with zero activities
4. Test: GET /api/plans includes budget summary for each plan

**Budget Statistics Endpoint**
1. Test: GET /api/plans/:id/budget returns detailed breakdown
2. Test: Includes all budget metrics (spent, remaining, utilization)
3. Test: Includes cost by category
4. Test: Includes cost by date
5. Test: Returns 404 for non-existent plan
6. Test: Returns 403 for plan owned by another user
7. Test: Unauthenticated request returns 401 error

**Activity Creation with Budget**
1. Test: Creating activity updates plan budget calculations
2. Test: Budget warning included when activity exceeds remaining
3. Test: Can still create activity even if over budget (warning only)

**Activity Deletion with Budget**
1. Test: Deleting activity updates plan budget calculations
2. Test: Budget recalculated correctly after deletion

## Success Criteria

- [ ] Budget calculation service implemented
  - Calculate total spent across all activities
  - Calculate remaining budget
  - Calculate budget utilization percentage
  - Group costs by category
- [ ] Plan endpoints enhanced with budget data
  - GET /api/plans/:id includes budget calculations
  - GET /api/plans includes budget summary per plan
  - Budget data accurate and up-to-date
- [ ] Budget statistics endpoint implemented
  - GET /api/plans/:id/budget returns detailed breakdown
  - Includes all required metrics
  - Validates plan ownership
- [ ] Budget warnings implemented
  - Warn when activity exceeds remaining budget
  - Don't prevent over-budget activities (warning only)
- [ ] Database queries optimized
  - Efficient aggregation queries
  - Proper indexing for performance
- [ ] Budget calculations update in real-time
  - Creating activity updates budget
  - Updating activity cost updates budget
  - Deleting activity updates budget
- [ ] All tests pass: `npm test --workspace=backend`
- [ ] No linting errors: `npm run lint --workspace=backend`

## Notes

- Budget warnings should be informative, not restrictive
- Consider caching budget calculations for performance
- Recalculate budget when activities change
- Support multiple currencies (optional for MVP)
- Consider adding budget alerts/notifications
- Track budget changes over time for analytics
- Test edge cases: negative costs, zero budget, etc.

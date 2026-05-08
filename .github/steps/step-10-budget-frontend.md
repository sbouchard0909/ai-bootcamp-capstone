# Step 10: Budget Tracking (Frontend)

## Overview
Implement frontend UI for displaying budget information, spending breakdowns, and budget alerts with visual representations.

## Frontend Tasks

### Budget Service
Create budget API service:
```typescript
// services/budgetService.ts
export const budgetService = {
  getBudgetDetails: (planId: string) => Promise<BudgetDetails>,
};

interface BudgetDetails {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  budgetUtilization: number;
  costByCategory: Record<string, number>;
  costByDate: Record<string, number>;
  isOverBudget: boolean;
}
```

### Budget Overview Component
Create component for plan details page:
- Budget summary card:
  - Total budget
  - Total spent
  - Remaining budget
  - Visual progress bar
- Color coding:
  - Green: < 75% utilized
  - Yellow: 75-100% utilized
  - Red: > 100% utilized (over budget)

### Budget Progress Bar
Visual indicator of budget utilization:
- Horizontal bar showing spent vs remaining
- Percentage display
- Color changes based on utilization
- Smooth animations

### Budget Breakdown Component
Detailed spending analysis:
- Pie chart or bar chart for cost by category
- Table view with category breakdown
- Percentage of budget per category
- Category icons and colors

### Budget Alert Component
Warning when approaching or exceeding budget:
- Alert banner when > 90% utilized
- Warning banner when > 100% utilized
- Dismissible alerts
- Clear messaging about overspending

### Spending Timeline
Visual representation of spending over time:
- Line or area chart showing cumulative spending
- Compare against linear budget distribution
- Highlight over-budget periods
- Interactive tooltips

### Activity Form Enhancement
Update activity forms to show budget impact:
- Display remaining budget
- Calculate new remaining after adding activity cost
- Warning if activity will exceed budget
- Don't prevent submission (warning only)

### Budget Statistics Page (Optional)
Dedicated page for detailed budget analysis:
- All budget metrics
- Multiple chart types
- Export functionality
- Historical trends

### Responsive Budget Display
Adapt budget components for different screens:
- Compact view on mobile
- Full details on desktop
- Collapsible sections for space

## Testing Requirements

### Frontend Tests (TDD - Write First!)

**Budget Service**
1. Test: getBudgetDetails() calls correct API endpoint
2. Test: Returns properly formatted budget data
3. Test: API errors properly handled

**Budget Overview Component**
1. Test: Displays total budget, spent, and remaining
2. Test: Progress bar shows correct percentage
3. Test: Color changes based on utilization (green/yellow/red)
4. Test: Shows "Over Budget" label when exceeded
5. Test: Updates when activities change

**Budget Progress Bar**
1. Test: Bar width matches budget utilization percentage
2. Test: Shows correct color for utilization level
3. Test: Displays percentage text
4. Test: Handles edge cases (0%, 100%, >100%)

**Budget Breakdown Component**
1. Test: Displays cost for each category
2. Test: Shows percentage of total per category
3. Test: Categories without spending show $0
4. Test: Chart renders correctly
5. Test: Table view shows all categories

**Budget Alert Component**
1. Test: No alert when < 90% utilized
2. Test: Warning alert when > 90% utilized
3. Test: Danger alert when > 100% utilized
4. Test: Alert can be dismissed
5. Test: Alert reappears on page reload if condition persists

**Activity Form with Budget**
1. Test: Displays current remaining budget
2. Test: Calculates impact of new activity cost
3. Test: Shows warning when will exceed budget
4. Test: Allows submission even with warning
5. Test: Warning clears when cost reduced

**Spending Timeline**
1. Test: Chart displays spending over plan duration
2. Test: Shows cumulative spending correctly
3. Test: Highlights over-budget periods
4. Test: Interactive tooltips work

### UI Tests (Playwright - Max 5 tests)
1. Test: Budget overview displays correct calculations
2. Test: Adding activity updates budget display
3. Test: Budget alert appears when exceeding budget
4. Test: Budget breakdown shows spending by category
5. Test: Budget warning shows in activity form before submission

## Success Criteria

- [ ] Budget service created with API methods
- [ ] Budget overview component displays on plan details
  - Shows budget, spent, remaining
  - Progress bar with color coding
  - Updates dynamically
- [ ] Budget progress bar implemented
  - Visual representation of utilization
  - Color changes based on percentage
  - Smooth animations
- [ ] Budget breakdown component displays
  - Cost by category with icons
  - Pie or bar chart visualization
  - Percentage calculations
- [ ] Budget alerts implemented
  - Warning at 90% utilization
  - Danger alert when over budget
  - Dismissible but persistent
- [ ] Spending timeline visualization
  - Chart showing spending over time
  - Cumulative calculations
  - Interactive tooltips
- [ ] Activity forms show budget impact
  - Display remaining budget
  - Calculate impact before submission
  - Warning for over-budget activities
- [ ] Budget displays responsive
  - Works on all screen sizes
  - Appropriate layouts for mobile/desktop
- [ ] All frontend tests pass: `npm test --workspace=frontend`
- [ ] All UI tests pass: `npm run test:ui --workspace=frontend`
- [ ] No linting errors: `npm run lint --workspace=frontend`

## Notes

- Use a charting library (Chart.js, Recharts, or similar)
- Currency formatting throughout
- Real-time updates when activities change
- Consider animations for better UX
- Make charts accessible with ARIA labels
- Budget warnings should be helpful, not annoying
- Allow users to adjust budget easily
- Show budget status at a glance

# Step 11: Dashboard and Summary Views

## Overview
Implement a user dashboard with vacation plan summaries, upcoming trips, budget overviews, and quick actions.

## Backend Tasks

### Dashboard Endpoint
Create dashboard summary endpoint:
- `GET /api/dashboard` - Get user's dashboard data
  - Upcoming vacations (sorted by start date)
  - Active vacation (if any)
  - Recently completed vacations
  - Total budget across all plans
  - Total spending across all plans
  - Plans by status counts

### Dashboard Statistics
Calculate and return dashboard metrics:
```typescript
interface DashboardData {
  upcomingPlans: VacationPlan[];
  activePlans: VacationPlan[];
  completedPlans: VacationPlan[];
  statistics: {
    totalPlans: number;
    totalBudget: number;
    totalSpent: number;
    plansByStatus: Record<string, number>;
  };
}
```

### Auto-Update Plan Status
Create background job or endpoint to update plan statuses:
- 'upcoming' → 'active' when start date reached
- 'active' → 'completed' when end date passed
- Run on dashboard fetch or via scheduled job

## Frontend Tasks

### Dashboard Page
Create main dashboard view:
- Welcome message with user name
- Quick statistics cards:
  - Total upcoming trips
  - Total budget across plans
  - Next trip countdown
  - Active trips
- Upcoming trips section
- Recent activity section
- Quick action buttons

### Statistics Cards Component
Display key metrics:
- Card for each statistic
- Icons representing each metric
- Color coding for visual appeal
- Click to navigate to relevant page

### Upcoming Trips Section
Show next 3-5 upcoming vacations:
- Trip card with:
  - Destination
  - Date range
  - Days until trip
  - Budget status indicator
- "See All" link to plans page

### Active Trip Banner
Highlight currently active vacation (if any):
- Prominent display at top of dashboard
- Days remaining
- Budget status
- Quick link to plan details

### Recent Activity Section
Show recent actions:
- Recently created plans
- Recently added activities
- Budget updates
- Timeline view

### Quick Actions
Buttons for common tasks:
- "Create New Plan"
- "View All Plans"
- "Browse Destinations" (optional)

### Empty State
When user has no plans:
- Welcome message
- Explanation of app features
- Prominent "Create Your First Plan" button
- Sample screenshots or illustrations

## Testing Requirements

### Backend Tests (TDD - Write First!)

**Dashboard Endpoint**
1. Test: GET /api/dashboard returns dashboard data with 200
2. Test: Includes upcoming, active, and completed plans
3. Test: Includes statistics (counts, budgets)
4. Test: Plans sorted correctly by date
5. Test: Only returns authenticated user's data
6. Test: Unauthenticated request returns 401 error

**Dashboard Statistics**
1. Test: Statistics include correct plan counts
2. Test: Total budget calculated across all plans
3. Test: Total spent calculated across all activities
4. Test: Plans grouped by status correctly

**Status Auto-Update**
1. Test: Plan status updates to 'active' on start date
2. Test: Plan status updates to 'completed' after end date
3. Test: 'cancelled' plans don't auto-update

### Frontend Tests (TDD - Write First!)

**Dashboard Page**
1. Test: Displays welcome message with user name
2. Test: Shows statistics cards
3. Test: Displays upcoming trips section
4. Test: Shows empty state when no plans
5. Test: Quick actions render and navigate correctly

**Statistics Cards**
1. Test: Each card displays correct metric
2. Test: Cards clickable and navigate to relevant pages
3. Test: Icons and colors display correctly

**Upcoming Trips Section**
1. Test: Shows next upcoming trips
2. Test: Displays trip details (destination, dates, budget)
3. Test: "See All" link navigates to plans page
4. Test: Handles case with no upcoming trips

**Active Trip Banner**
1. Test: Banner displayed when trip is active
2. Test: Shows days remaining
3. Test: Banner hidden when no active trips
4. Test: Links to plan details

**Empty State**
1. Test: Shows when user has no plans
2. Test: "Create First Plan" button navigates correctly
3. Test: Displays helpful messaging

### UI Tests (Playwright - Max 5 tests)
1. Test: Dashboard displays with user's upcoming trips
2. Test: Click trip card navigates to plan details
3. Test: "Create New Plan" quick action works
4. Test: Statistics cards display correct counts
5. Test: Empty state shows for new user

## Success Criteria

- [ ] Dashboard endpoint implemented: GET /api/dashboard
  - Returns upcoming, active, completed plans
  - Includes statistics and counts
  - Validates authentication
- [ ] Dashboard statistics calculated correctly
  - Plan counts by status
  - Total budgets and spending
- [ ] Plan status auto-update logic implemented
- [ ] Dashboard page renders with all sections
  - Welcome message
  - Statistics cards
  - Upcoming trips
  - Quick actions
- [ ] Statistics cards component displays metrics
  - Clickable navigation
  - Icons and visual design
- [ ] Upcoming trips section shows next trips
  - Trip cards with details
  - "See All" link
- [ ] Active trip banner displays when applicable
  - Days remaining countdown
  - Quick navigation
- [ ] Empty state for users with no plans
  - Helpful messaging
  - Create plan call-to-action
- [ ] All backend tests pass: `npm test --workspace=backend`
- [ ] All frontend tests pass: `npm test --workspace=frontend`
- [ ] All UI tests pass: `npm run test:ui --workspace=frontend`
- [ ] No linting errors in both packages

## Notes

- Dashboard should load quickly - optimize queries
- Use skeleton loaders for better perceived performance
- Make dashboard the default landing page after login
- Consider personalization based on user preferences
- Add "last visited" plans for easy access
- Show notifications/alerts on dashboard
- Keep design clean and not overwhelming

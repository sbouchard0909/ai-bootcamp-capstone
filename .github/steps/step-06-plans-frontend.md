# Step 6: Vacation Plans CRUD (Frontend)

## Overview
Implement frontend UI for creating, viewing, updating, and deleting vacation plans with forms, list views, and navigation.

## Frontend Tasks

### Plans Service
Create API service methods:
```typescript
// services/plansService.ts
export const plansService = {
  getAll: () => Promise<VacationPlan[]>,
  getById: (id: string) => Promise<VacationPlan>,
  create: (data: CreatePlanData) => Promise<VacationPlan>,
  update: (id: string, data: UpdatePlanData) => Promise<VacationPlan>,
  delete: (id: string) => Promise<void>,
};
```

### Plans Context
Create React Context for plans state:
```typescript
interface PlansContextType {
  plans: VacationPlan[];
  loading: boolean;
  error: string | null;
  fetchPlans: () => Promise<void>;
  createPlan: (data: CreatePlanData) => Promise<void>;
  updatePlan: (id: string, data: UpdatePlanData) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
}
```

### Plans List Page
- Display all vacation plans
- Show plan cards with key info:
  - Name, destination
  - Dates, duration
  - Budget
  - Status badge
- Empty state when no plans
- Loading state
- Error handling
- "Create Plan" button

### Plan Card Component
- Reusable card for displaying plan summary
- Click to view details
- Action buttons: Edit, Delete
- Status badge with color coding
- Date formatting

### Create Plan Page/Modal
- Form with all required fields:
  - Name input
  - Destination input
  - Start date picker
  - End date picker
  - Budget input (number)
  - Description textarea (optional)
- Form validation
- Submit and cancel actions
- Success/error feedback

### Plan Details Page
- Show complete plan information
- Edit button
- Delete button with confirmation
- Back to list navigation
- Activity section (placeholder for later)

### Edit Plan Page/Modal
- Pre-populated form with existing data
- Same validations as create form
- Save and cancel actions
- Success/error feedback

### Delete Confirmation
- Confirmation modal/dialog
- Show plan name being deleted
- Confirm and cancel buttons
- Prevent accidental deletion

### Form Validation
- Client-side validation for all fields
- Date range validation (end > start)
- Budget must be positive
- Required field indicators
- Display validation errors inline

### Routing
Set up routes:
- `/plans` - List all plans
- `/plans/new` - Create new plan
- `/plans/:id` - View plan details
- `/plans/:id/edit` - Edit plan

## Testing Requirements

### Frontend Tests (TDD - Write First!)

**Plans Service**
1. Test: getAll() calls correct API endpoint
2. Test: create() posts data and returns new plan
3. Test: update() puts data and returns updated plan
4. Test: delete() sends delete request
5. Test: API errors properly handled

**Plans Context**
1. Test: Initial state has empty plans array
2. Test: fetchPlans() updates plans state
3. Test: createPlan() adds plan to state
4. Test: updatePlan() updates plan in state
5. Test: deletePlan() removes plan from state
6. Test: Loading state managed correctly

**Plans List Component**
1. Test: Displays list of plans
2. Test: Shows empty state when no plans
3. Test: Shows loading state while fetching
4. Test: Displays error message on fetch failure
5. Test: "Create Plan" button navigates to create page

**Plan Card Component**
1. Test: Displays plan name and destination
2. Test: Displays formatted dates
3. Test: Displays budget
4. Test: Shows correct status badge
5. Test: Click navigates to plan details

**Create Plan Form**
1. Test: Form renders with all fields
2. Test: Submit button disabled with invalid data
3. Test: Successful creation redirects to plan list
4. Test: API error displays error message
5. Test: Date validation prevents invalid ranges
6. Test: Budget validation prevents negative numbers

**Plan Details Page**
1. Test: Displays complete plan information
2. Test: Edit button navigates to edit page
3. Test: Delete button shows confirmation
4. Test: Back button navigates to list

**Edit Plan Form**
1. Test: Form pre-populated with existing data
2. Test: Successful update redirects to details
3. Test: Cancel button navigates back
4. Test: Validation errors displayed

**Delete Confirmation**
1. Test: Confirmation modal displays plan name
2. Test: Confirm button deletes plan
3. Test: Cancel button closes modal without deleting

### UI Tests (Playwright - Max 5 tests)
1. Test: Create a new vacation plan with valid data
2. Test: View plan details from list
3. Test: Edit existing plan and see updates
4. Test: Delete plan with confirmation
5. Test: Form validation displays errors for invalid data

## Success Criteria

- [ ] Plans service created with all CRUD methods
- [ ] Plans context manages global state
- [ ] Plans list page displays all plans
  - Shows plan cards with key information
  - Handles loading and error states
  - Empty state for no plans
- [ ] Plan card component displays plan summary
  - Clickable to view details
  - Shows status with color coding
- [ ] Create plan form implemented
  - All required fields present
  - Client-side validation
  - Success redirects to plan list
  - Error handling
- [ ] Plan details page shows complete information
  - Edit and delete actions available
  - Navigation back to list
- [ ] Edit plan form pre-populated with data
  - Same validation as create form
  - Updates reflected immediately
- [ ] Delete confirmation prevents accidental deletion
  - Shows plan name
  - Requires explicit confirmation
- [ ] Routing configured for all plan pages
- [ ] All frontend tests pass: `npm test --workspace=frontend`
- [ ] All UI tests pass: `npm run test:ui --workspace=frontend`
- [ ] No linting errors: `npm run lint --workspace=frontend`

## Notes

- Use date pickers for better UX (react-datepicker or native)
- Format currencies appropriately
- Status badges should have distinct colors
- Consider using a modal for create/edit forms
- Show loading indicators during API calls
- Optimistic updates for better perceived performance
- Handle network errors gracefully
- Make forms accessible with proper labels

# Step 8: Activities Management (Frontend)

## Overview
Implement frontend UI for managing activities within vacation plans including creation, display, editing, and deletion with daily organization.

## Frontend Tasks

### Activities Service
Create API service methods:
```typescript
// services/activitiesService.ts
export const activitiesService = {
  getAll: (planId: string) => Promise<Activity[]>,
  getById: (planId: string, id: string) => Promise<Activity>,
  create: (planId: string, data: CreateActivityData) => Promise<Activity>,
  update: (planId: string, id: string, data: UpdateActivityData) => Promise<Activity>,
  delete: (planId: string, id: string) => Promise<void>,
};
```

### Activity Types
Define TypeScript types:
```typescript
type ActivityCategory = 'dining' | 'sightseeing' | 'accommodation' | 'transport' | 'entertainment' | 'other';

interface Activity {
  id: string;
  planId: string;
  name: string;
  date: string;
  startTime?: string;
  endTime?: string;
  cost: number;
  category: ActivityCategory;
  description?: string;
  location?: string;
}
```

### Plan Details Enhancement
Update plan details page to include activities:
- Activities section grouped by date
- "Add Activity" button
- Total activities cost display
- Timeline/calendar view of activities

### Activities List Component
- Display activities grouped by date
- Show date headers
- List activities for each day chronologically
- Empty state for days without activities
- Total cost per day

### Activity Card Component
- Display activity details:
  - Name, time range
  - Category icon/badge
  - Cost
  - Location (if provided)
- Edit and delete buttons
- Category color coding

### Create Activity Form
- Form fields:
  - Name input
  - Date picker (constrained to plan dates)
  - Start time picker
  - End time picker
  - Cost input (number)
  - Category dropdown
  - Location input (optional)
  - Description textarea (optional)
- Form validation
- Submit and cancel actions
- Success/error feedback

### Edit Activity Form
- Pre-populated with existing data
- Same validations as create form
- Save and cancel actions
- Success/error feedback

### Delete Confirmation
- Confirmation modal for activity deletion
- Show activity name
- Confirm and cancel buttons

### Category Configuration
Define category options with icons/colors:
```typescript
const categories = {
  dining: { label: 'Dining', icon: '🍽️', color: 'blue' },
  sightseeing: { label: 'Sightseeing', icon: '🏛️', color: 'green' },
  accommodation: { label: 'Accommodation', icon: '🏨', color: 'purple' },
  transport: { label: 'Transport', icon: '🚗', color: 'orange' },
  entertainment: { label: 'Entertainment', icon: '🎭', color: 'pink' },
  other: { label: 'Other', icon: '📌', color: 'gray' },
};
```

### Form Validation
- Date must be within plan date range
- End time must be after start time (if both provided)
- Cost must be non-negative
- Required field indicators
- Display validation errors inline

### Budget Integration
- Calculate total activities cost
- Display remaining budget on plan page
- Warning when activities exceed plan budget
- Cost breakdown by category

## Testing Requirements

### Frontend Tests (TDD - Write First!)

**Activities Service**
1. Test: getAll() calls correct API endpoint with planId
2. Test: create() posts data and returns new activity
3. Test: update() puts data and returns updated activity
4. Test: delete() sends delete request
5. Test: API errors properly handled

**Activities List Component**
1. Test: Displays activities grouped by date
2. Test: Shows date headers
3. Test: Shows empty state when no activities
4. Test: Activities sorted by time within each date
5. Test: Displays total cost per day

**Activity Card Component**
1. Test: Displays activity name and time
2. Test: Shows category icon and badge
3. Test: Displays cost and location
4. Test: Edit button opens edit form
5. Test: Delete button shows confirmation

**Create Activity Form**
1. Test: Form renders with all fields
2. Test: Date picker constrained to plan dates
3. Test: Submit button disabled with invalid data
4. Test: Successful creation adds activity to list
5. Test: Time validation prevents invalid ranges
6. Test: Cost validation prevents negative numbers
7. Test: Category dropdown shows all options

**Edit Activity Form**
1. Test: Form pre-populated with existing data
2. Test: Successful update reflects in list
3. Test: Cancel button closes form without saving
4. Test: Validation errors displayed

**Budget Display**
1. Test: Shows total activities cost
2. Test: Calculates remaining budget
3. Test: Warning shown when over budget
4. Test: Cost breakdown by category displayed

**Delete Confirmation**
1. Test: Confirmation modal displays activity name
2. Test: Confirm button deletes activity
3. Test: Cancel button closes modal without deleting

### UI Tests (Playwright - Max 5 tests)
1. Test: Add new activity to vacation plan
2. Test: Edit existing activity and see updates
3. Test: Delete activity with confirmation
4. Test: Activities displayed grouped by date
5. Test: Form validation prevents invalid time ranges

## Success Criteria

- [ ] Activities service created with all CRUD methods
- [ ] Plan details page enhanced with activities section
  - Activities grouped by date
  - Timeline/calendar view
  - "Add Activity" button
- [ ] Activities list component displays grouped activities
  - Date headers
  - Chronological ordering
  - Empty state handling
- [ ] Activity card component displays activity details
  - Category with icon and color
  - Time and cost information
  - Edit and delete actions
- [ ] Create activity form implemented
  - All required fields present
  - Date constrained to plan dates
  - Category selection
  - Client-side validation
- [ ] Edit activity form pre-populated with data
  - Same validation as create form
  - Updates reflected immediately
- [ ] Delete confirmation prevents accidental deletion
- [ ] Budget integration shows:
  - Total activities cost
  - Remaining budget
  - Over-budget warnings
  - Cost breakdown by category
- [ ] Category configuration with icons and colors
- [ ] All frontend tests pass: `npm test --workspace=frontend`
- [ ] All UI tests pass: `npm run test:ui --workspace=frontend`
- [ ] No linting errors: `npm run lint --workspace=frontend`

## Notes

- Use time pickers for better UX
- Consider drag-and-drop for reordering activities
- Show activities on a visual timeline
- Category icons improve scannability
- Currency formatting for costs
- Support activities without specific times
- Consider adding duration calculation
- Make forms accessible
- Handle timezone considerations

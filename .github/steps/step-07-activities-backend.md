# Step 7: Activities Management (Backend)

## Overview
Implement backend API for managing activities within vacation plans including CRUD operations, categorization, and scheduling.

## Backend Tasks

### Activity Model
Create activity data model:
```typescript
interface Activity {
  id: string;
  planId: string;           // Foreign key to vacation plan
  name: string;             // Activity name
  date: string;             // ISO date
  startTime?: string;       // HH:MM format
  endTime?: string;         // HH:MM format
  cost: number;             // Activity cost
  category: 'dining' | 'sightseeing' | 'accommodation' | 'transport' | 'entertainment' | 'other';
  description?: string;     // Optional notes
  location?: string;        // Optional location details
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Schema
- Create activities table migration
- Add foreign key to vacation_plans table
- Add indexes for planId and date lookups
- Add cascade delete when plan is deleted
- Implement CRUD operations in database layer

### Activities Routes
Create activity endpoints:
- `POST /api/plans/:planId/activities` - Create activity
- `GET /api/plans/:planId/activities` - Get all plan activities
- `GET /api/plans/:planId/activities/:id` - Get specific activity
- `PUT /api/plans/:planId/activities/:id` - Update activity
- `DELETE /api/plans/:planId/activities/:id` - Delete activity

### Authorization
- Verify user owns the plan before any activity operation
- Return 403 Forbidden if user tries to access activities of another user's plan
- Return 404 if plan or activity doesn't exist

### Validation
- Required fields: name, date, cost, category
- Date validation: activity date must be within plan date range
- Time validation: endTime must be after startTime (if both provided)
- Cost validation: must be non-negative number
- Category validation: must be one of allowed values
- Name length: max 200 characters

### Business Logic
- Verify plan exists before creating activity
- Calculate total activities cost per plan
- Group activities by date for organization
- Update plan's updatedAt timestamp when activities change

## Testing Requirements

### Backend Tests (TDD - Write First!)

**Create Activity**
1. Test: Create activity with valid data returns 201 and activity object
2. Test: Activity associated with correct plan
3. Test: Activity includes auto-generated ID and timestamps
4. Test: Missing required fields returns 400 error
5. Test: Activity date outside plan range returns 400 error
6. Test: Invalid time range (end before start) returns 400 error
7. Test: Negative cost returns 400 error
8. Test: Invalid category returns 400 error
9. Test: Non-existent plan returns 404 error
10. Test: Plan owned by another user returns 403 error
11. Test: Unauthenticated request returns 401 error

**Get All Activities**
1. Test: Returns array of plan's activities with 200 status
2. Test: Returns empty array if plan has no activities
3. Test: Activities sorted by date and time
4. Test: Only returns activities for specified plan
5. Test: Plan owned by another user returns 403 error
6. Test: Unauthenticated request returns 401 error

**Get Single Activity**
1. Test: Returns activity details with 200 status
2. Test: Returns 404 if activity doesn't exist
3. Test: Returns 403 if plan belongs to another user
4. Test: Unauthenticated request returns 401 error

**Update Activity**
1. Test: Update activity returns 200 and updated activity
2. Test: Can update all fields except id and planId
3. Test: Updates updatedAt timestamp
4. Test: Cannot change planId
5. Test: Date must still be within plan range
6. Test: Returns 404 if activity doesn't exist
7. Test: Returns 403 if plan belongs to another user
8. Test: Invalid data returns 400 error
9. Test: Unauthenticated request returns 401 error

**Delete Activity**
1. Test: Delete activity returns 204 status
2. Test: Activity removed from database
3. Test: Returns 404 if activity doesn't exist
4. Test: Returns 403 if plan belongs to another user
5. Test: Unauthenticated request returns 401 error

**Cascade Operations**
1. Test: Deleting plan also deletes associated activities

## Success Criteria

- [ ] Activity model defined with proper TypeScript types
- [ ] activities table created in database with foreign key to plans
- [ ] Create endpoint: `POST /api/plans/:planId/activities` implemented
  - Validates all required fields
  - Validates date within plan range
  - Validates time range and cost
  - Returns created activity with 201 status
- [ ] Get all activities endpoint: `GET /api/plans/:planId/activities` implemented
  - Returns only activities for specified plan
  - Activities sorted by date and time
  - Validates plan ownership
- [ ] Get single activity endpoint: `GET /api/plans/:planId/activities/:id` implemented
  - Returns activity details
  - Validates plan ownership
- [ ] Update endpoint: `PUT /api/plans/:planId/activities/:id` implemented
  - Validates plan ownership
  - Validates updated data
  - Updates timestamps
  - Returns updated activity
- [ ] Delete endpoint: `DELETE /api/plans/:planId/activities/:id` implemented
  - Validates plan ownership
  - Removes activity from database
  - Returns 204 status
- [ ] Cascade delete implemented (deleting plan deletes activities)
- [ ] All authorization checks implemented
- [ ] All validation rules enforced
- [ ] All tests pass: `npm test --workspace=backend`
- [ ] No linting errors: `npm run lint --workspace=backend`

## Notes

- Activities belong to a single plan
- Consider timezone handling for dates and times
- Category colors/icons for better UX (implement on frontend)
- Track total cost across all activities
- Allow activities without specific times (all-day events)
- Consider adding priority or status fields (optional)
- Test edge cases: midnight times, multi-day activities

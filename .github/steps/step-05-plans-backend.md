# Step 5: Vacation Plans CRUD (Backend)

## Overview
Implement backend API for creating, reading, updating, and deleting vacation plans with full CRUD operations and user ownership validation.

## Backend Tasks

### Vacation Plan Model
Create vacation plan data model:
```typescript
interface VacationPlan {
  id: string;
  userId: string;           // Owner of the plan
  name: string;             // Plan name/title
  destination: string;      // Where they're going
  startDate: string;        // ISO date
  endDate: string;          // ISO date
  budget: number;           // Total budget
  description?: string;     // Optional notes
  status: 'planning' | 'upcoming' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Schema
- Create vacation_plans table migration
- Add foreign key to users table
- Add indexes for userId and date lookups
- Implement CRUD operations in database layer

### Vacation Plans Routes
Create vacation plan endpoints:
- `POST /api/plans` - Create new plan (authenticated)
- `GET /api/plans` - Get all user's plans (authenticated)
- `GET /api/plans/:id` - Get specific plan (authenticated, owner only)
- `PUT /api/plans/:id` - Update plan (authenticated, owner only)
- `DELETE /api/plans/:id` - Delete plan (authenticated, owner only)

### Authorization
- Verify user owns the plan before update/delete
- Return 403 Forbidden if user tries to access another user's plan
- Return 404 if plan doesn't exist

### Validation
- Required fields: name, destination, startDate, endDate, budget
- Date validation: endDate must be after startDate
- Budget validation: must be positive number
- Status validation: must be one of allowed values
- Name length: max 200 characters

### Business Logic
- Set default status to 'planning' on creation
- Auto-update timestamps on changes
- Calculate duration (days) from dates
- Validate dates are not in the past for new plans

## Testing Requirements

### Backend Tests (TDD - Write First!)

**Create Vacation Plan**
1. Test: Create plan with valid data returns 201 and plan object
2. Test: Plan includes auto-generated ID and timestamps
3. Test: Plan associated with authenticated user
4. Test: Default status is 'planning'
5. Test: Missing required fields returns 400 error
6. Test: Invalid date range (end before start) returns 400 error
7. Test: Negative budget returns 400 error
8. Test: Unauthenticated request returns 401 error

**Get All Plans**
1. Test: Returns array of user's plans with 200 status
2. Test: Returns empty array if user has no plans
3. Test: Only returns plans owned by authenticated user
4. Test: Plans sorted by startDate (newest first)
5. Test: Unauthenticated request returns 401 error

**Get Single Plan**
1. Test: Returns plan details with 200 status
2. Test: Returns 404 if plan doesn't exist
3. Test: Returns 403 if plan belongs to another user
4. Test: Unauthenticated request returns 401 error

**Update Plan**
1. Test: Update plan returns 200 and updated plan
2. Test: Can update name, destination, dates, budget, description
3. Test: Can update status
4. Test: Updates updatedAt timestamp
5. Test: Cannot update userId or id
6. Test: Returns 404 if plan doesn't exist
7. Test: Returns 403 if plan belongs to another user
8. Test: Invalid data returns 400 error
9. Test: Unauthenticated request returns 401 error

**Delete Plan**
1. Test: Delete plan returns 204 status
2. Test: Plan removed from database
3. Test: Returns 404 if plan doesn't exist
4. Test: Returns 403 if plan belongs to another user
5. Test: Unauthenticated request returns 401 error

## Success Criteria

- [ ] Vacation plan model defined with proper TypeScript types
- [ ] vacation_plans table created in database
- [ ] Create endpoint: `POST /api/plans` implemented
  - Validates all required fields
  - Validates date range and budget
  - Associates plan with authenticated user
  - Returns created plan with 201 status
- [ ] Get all plans endpoint: `GET /api/plans` implemented
  - Returns only authenticated user's plans
  - Plans sorted by startDate
- [ ] Get single plan endpoint: `GET /api/plans/:id` implemented
  - Returns plan details
  - Validates ownership
  - Returns 403 for unauthorized access
- [ ] Update endpoint: `PUT /api/plans/:id` implemented
  - Validates ownership
  - Validates updated data
  - Updates timestamps
  - Returns updated plan
- [ ] Delete endpoint: `DELETE /api/plans/:id` implemented
  - Validates ownership
  - Removes plan from database
  - Returns 204 status
- [ ] All authorization checks implemented (owner only)
- [ ] All validation rules enforced
- [ ] All tests pass: `npm test --workspace=backend`
- [ ] No linting errors: `npm run lint --workspace=backend`

## Notes

- Use authenticated user ID from JWT token
- Never allow users to access other users' plans
- Validate dates carefully (timezone considerations)
- Consider soft delete for better data retention (optional)
- Log plan operations for audit trail
- Return consistent error messages
- Test edge cases: same-day trips, long durations, etc.

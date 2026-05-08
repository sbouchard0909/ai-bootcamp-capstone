# Step 13: Profile Management

## Overview
Implement user profile viewing and editing capabilities including account settings and profile information updates.

## Backend Tasks

### Profile Endpoints
Create profile management endpoints:
- `GET /api/profile` - Get current user's profile
- `PUT /api/profile` - Update user profile
- `PUT /api/profile/password` - Change password
- `DELETE /api/profile` - Delete user account (with confirmation)

### Profile Fields
Updateable profile information:
```typescript
interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  // Optional fields
  avatar?: string;
  phone?: string;
  preferences?: {
    currency: string;
    dateFormat: string;
    notifications: boolean;
  };
}
```

### Profile Update Validation
- Email uniqueness check (if changed)
- Email format validation
- Name required and max length
- Phone format validation (optional)
- Sanitize all inputs

### Password Change
- Require current password for verification
- Validate new password strength
- Hash new password with bcrypt
- Return success/error message

### Account Deletion
- Require password confirmation
- Soft delete or hard delete option
- Cascade delete all user's plans and activities
- Return confirmation

## Frontend Tasks

### Profile Page
Create user profile view:
- Display current profile information
- Edit button to enable editing
- Profile sections:
  - Basic info (name, email)
  - Optional info (phone, avatar)
  - Preferences
  - Account actions

### Profile View Component
Read-only profile display:
- User name and email
- Avatar (if set)
- Member since date
- Account statistics:
  - Total plans created
  - Total activities planned
  - Total budget managed

### Profile Edit Form
Editable profile form:
- Name input
- Email input (with uniqueness check)
- Phone input (optional)
- Avatar upload (optional)
- Preferences:
  - Currency selector
  - Date format selector
  - Notifications toggle
- Save and cancel buttons

### Password Change Form
Separate password update form:
- Current password input
- New password input
- Confirm new password input
- Password strength indicator
- Submit button

### Account Deletion
Dangerous action with confirmation:
- "Delete Account" button in settings
- Confirmation modal/dialog:
  - Warning about data loss
  - Password confirmation required
  - "I understand" checkbox
  - Final delete button (red/danger styled)
- Success redirect to logout

### Form Validation
- Client-side validation for all fields
- Email format and uniqueness
- Password strength requirements
- Phone format (if provided)
- Required field indicators

### Avatar Upload (Optional)
If implementing avatar:
- Image upload component
- Preview before save
- Image size validation
- Format validation (jpg, png)
- Crop/resize functionality

## Testing Requirements

### Backend Tests (TDD - Write First!)

**Get Profile**
1. Test: GET /api/profile returns current user's profile
2. Test: Password not included in response
3. Test: Unauthenticated request returns 401 error

**Update Profile**
1. Test: PUT /api/profile updates user information
2. Test: Updates name, email, phone successfully
3. Test: Returns updated profile data
4. Test: Email uniqueness validated (conflict returns 409)
5. Test: Invalid email format returns 400 error
6. Test: Updates updatedAt timestamp
7. Test: Cannot update another user's profile
8. Test: Unauthenticated request returns 401 error

**Change Password**
1. Test: Password change with correct current password succeeds
2. Test: Wrong current password returns 401 error
3. Test: New password is hashed in database
4. Test: Weak new password returns 400 error
5. Test: Unauthenticated request returns 401 error

**Delete Account**
1. Test: Account deletion with correct password succeeds
2. Test: Wrong password returns 401 error
3. Test: User removed from database
4. Test: User's plans and activities cascade deleted
5. Test: Unauthenticated request returns 401 error

### Frontend Tests (TDD - Write First!)

**Profile Page**
1. Test: Displays user profile information
2. Test: Shows account statistics
3. Test: Edit button enables edit mode
4. Test: Profile loads on mount

**Profile Edit Form**
1. Test: Form pre-populated with current data
2. Test: Successful update saves changes
3. Test: Cancel button reverts changes
4. Test: Email uniqueness validation works
5. Test: Invalid inputs show validation errors
6. Test: Loading state during save

**Password Change Form**
1. Test: Form renders with password fields
2. Test: Password strength indicator updates
3. Test: Mismatch between new and confirm shows error
4. Test: Success message on successful change
5. Test: Wrong current password shows error

**Account Deletion**
1. Test: Delete button shows confirmation modal
2. Test: Modal requires password and confirmation
3. Test: Cancel button closes modal without deleting
4. Test: Successful deletion logs out and redirects
5. Test: Wrong password shows error

### UI Tests (Playwright - Max 5 tests)
1. Test: View and edit profile information
2. Test: Change password successfully
3. Test: Email uniqueness validation prevents duplicate
4. Test: Account deletion requires confirmation
5. Test: Form validation prevents invalid updates

## Success Criteria

- [ ] Profile endpoints implemented
  - GET /api/profile returns current user
  - PUT /api/profile updates profile
  - PUT /api/profile/password changes password
  - DELETE /api/profile deletes account
- [ ] All validation rules enforced on backend
  - Email uniqueness
  - Password strength
  - Input sanitization
- [ ] Cascade delete for account deletion
- [ ] Profile page displays user information
  - Basic info and statistics
  - Edit mode toggle
- [ ] Profile edit form functional
  - All fields editable
  - Validation feedback
  - Save/cancel actions
- [ ] Password change form implemented
  - Current password verification
  - Strength indicator
  - Confirmation matching
- [ ] Account deletion with safeguards
  - Confirmation required
  - Password verification
  - Clear warnings
- [ ] All backend tests pass: `npm test --workspace=backend`
- [ ] All frontend tests pass: `npm test --workspace=frontend`
- [ ] All UI tests pass: `npm run test:ui --workspace=frontend`
- [ ] No linting errors in both packages

## Notes

- Keep profile updates simple for MVP
- Consider adding email verification for email changes
- Avatar upload can be deferred if complex
- Soft delete might be better for data retention
- Export user data before deletion (optional)
- Consider "deactivate" instead of delete
- Make password change require current password
- Clear sensitive data after account deletion

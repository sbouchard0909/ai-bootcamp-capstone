# Step 4: User Authentication (Frontend)

## Overview
Implement user registration, login, and authentication flow on the frontend with form validation, token management, and protected routes.

## Frontend Tasks

### Authentication Context
Create React Context for auth state:
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}
```

### Token Management
- Store JWT token in localStorage
- Add token to API request headers
- Remove token on logout
- Check token validity on app load

### Auth Service
Create API service methods:
```typescript
// services/authService.ts
export const authService = {
  register: (email: string, password: string, name: string) => Promise<User>,
  login: (email: string, password: string) => Promise<{ user: User; token: string }>,
  logout: () => void,
  getCurrentUser: () => Promise<User>,
};
```

### Registration Page
- Create registration form component
- Email input with validation
- Password input with strength indicator
- Name input
- Form submission handling
- Error message display
- Link to login page

### Login Page
- Create login form component
- Email input
- Password input
- Remember me checkbox (optional)
- Form submission handling
- Error message display
- Link to registration page

### Protected Routes
- Create PrivateRoute component
- Redirect to login if not authenticated
- Show loading state while checking auth

### Navigation
- Show/hide login/register links based on auth state
- Show user menu when authenticated
- Add logout functionality

### Form Validation
- Client-side email format validation
- Password strength requirements
- Required field validation
- Display validation errors inline

## Testing Requirements

### Frontend Tests (TDD - Write First!)

**Authentication Context**
1. Test: Initial state is not authenticated
2. Test: Login updates user and token state
3. Test: Logout clears user and token
4. Test: Token persists in localStorage
5. Test: Token loaded from localStorage on mount

**Registration Component**
1. Test: Form renders with all fields
2. Test: Submitting valid data calls register API
3. Test: Successful registration redirects to dashboard
4. Test: API error displays error message
5. Test: Email validation shows error for invalid email
6. Test: Password validation shows error for weak password
7. Test: Submit button disabled during submission

**Login Component**
1. Test: Form renders with email and password fields
2. Test: Submitting valid credentials calls login API
3. Test: Successful login redirects to dashboard
4. Test: Invalid credentials display error message
5. Test: Form validation prevents submission of empty fields
6. Test: Submit button disabled during submission

**Protected Routes**
1. Test: Authenticated user can access protected route
2. Test: Unauthenticated user redirected to login
3. Test: Loading state shown while checking authentication

**API Integration**
1. Test: Auth token included in API requests
2. Test: 401 responses trigger logout
3. Test: API errors handled and displayed

### UI Tests (Playwright - Max 5 tests)
1. Test: User can register with valid credentials
2. Test: User can login with valid credentials
3. Test: User can logout successfully
4. Test: Invalid login shows error message
5. Test: Protected route redirects to login when not authenticated

## Success Criteria

- [ ] Authentication context created and provides auth state
- [ ] Token stored in localStorage and persists across refreshes
- [ ] Registration page implemented with form validation
  - Email, password, and name inputs
  - Client-side validation with error messages
  - Successful registration redirects to dashboard
- [ ] Login page implemented with form validation
  - Email and password inputs
  - Error handling for invalid credentials
  - Successful login redirects to dashboard
- [ ] Protected routes implemented
  - Unauthenticated users redirected to login
  - Authenticated users can access protected content
- [ ] Navigation updates based on auth state
  - Login/Register links hidden when authenticated
  - User menu and logout shown when authenticated
- [ ] Auth token automatically added to API requests
- [ ] 401 responses trigger logout and redirect to login
- [ ] All frontend tests pass: `npm test --workspace=frontend`
- [ ] All UI tests pass: `npm run test:ui --workspace=frontend`
- [ ] No linting errors: `npm run lint --workspace=frontend`

## Notes

- Use React Context API for auth state management
- Keep forms accessible with proper labels and ARIA attributes
- Show loading states during API calls
- Display clear error messages for validation failures
- Consider password visibility toggle for better UX
- Add "Forgot Password" link (implement later)
- Test with both valid and invalid credentials

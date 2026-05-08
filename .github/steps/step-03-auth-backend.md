# Step 3: User Authentication (Backend)

## Overview
Implement user registration, login, and session management on the backend with secure password hashing and JWT-based authentication.

## Backend Tasks

### User Model
Create user data model:
```typescript
interface User {
  id: string;
  email: string;
  password: string;  // hashed
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Schema
- Create users table migration
- Add indexes for email lookup
- Implement user CRUD operations in database layer

### Authentication Routes
Create authentication endpoints:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Password Security
- Install `bcrypt` for password hashing
- Hash passwords before storing (salt rounds: 10)
- Compare hashed passwords on login
- Never return password in API responses

### JWT Authentication
- Install `jsonwebtoken`
- Generate JWT on successful login
- Set expiration (24 hours)
- Include user ID and email in token payload
- Return token in login response

### Authentication Middleware
Create middleware to verify JWT:
```typescript
// middleware/auth.ts
export const authenticateToken = (req, res, next) => {
  // Extract token from Authorization header
  // Verify token
  // Attach user to request object
  // Call next() or return 401
};
```

### Validation
- Email format validation
- Password strength requirements (min 8 chars)
- Email uniqueness check on registration
- Sanitize user inputs

## Testing Requirements

### Backend Tests (TDD - Write First!)

**User Registration**
1. Test: Register with valid data returns 201 and user object
2. Test: Password is hashed in database
3. Test: Password not included in response
4. Test: Duplicate email returns 409 conflict error
5. Test: Invalid email format returns 400 error
6. Test: Weak password returns 400 error
7. Test: Missing required fields returns 400 error

**User Login**
1. Test: Login with valid credentials returns 200 and JWT token
2. Test: Token payload includes user ID and email
3. Test: Login with wrong password returns 401 error
4. Test: Login with non-existent email returns 401 error
5. Test: Missing credentials returns 400 error

**Authentication Middleware**
1. Test: Valid token allows access to protected route
2. Test: Invalid token returns 401 error
3. Test: Missing token returns 401 error
4. Test: Expired token returns 401 error
5. Test: User information attached to request object

**Get Current User**
1. Test: Authenticated request returns current user info
2. Test: Password not included in response
3. Test: Unauthenticated request returns 401 error

## Success Criteria

- [ ] User model defined with proper TypeScript types
- [ ] Users table created in database
- [ ] Registration endpoint: `POST /api/auth/register` implemented
  - Validates email format and password strength
  - Hashes password with bcrypt
  - Returns user object (without password) and 201 status
  - Returns 409 for duplicate email
- [ ] Login endpoint: `POST /api/auth/login` implemented
  - Verifies credentials
  - Returns JWT token and user object
  - Returns 401 for invalid credentials
- [ ] Authentication middleware implemented
  - Verifies JWT tokens
  - Attaches user to request
  - Returns 401 for invalid/missing tokens
- [ ] Current user endpoint: `GET /api/auth/me` implemented
  - Requires authentication
  - Returns current user info
- [ ] Passwords never returned in API responses
- [ ] All validation errors return appropriate status codes and messages
- [ ] All tests pass: `npm test --workspace=backend`
- [ ] No linting errors: `npm run lint --workspace=backend`

## Notes

- Use bcrypt with salt rounds of 10 for password hashing
- JWT secret should be in environment variables
- Consider refresh tokens for better security (optional for MVP)
- Validate inputs on every endpoint
- Log authentication failures for security monitoring
- Return generic "Invalid credentials" message (don't reveal if email exists)

# Step 2: Backend API Foundation

## Overview
Create the foundational backend API structure with request/response handling, error middleware, logging, and database connection setup.

## Backend Tasks

### Express App Configuration
- Configure Express middleware:
  - `express.json()` for JSON parsing
  - CORS for frontend communication
  - Request logging middleware
  - Error handling middleware
- Set up environment configuration with dotenv

### API Route Structure
Create base route structure:
```
src/routes/
├── index.ts           # Main router
├── health.ts          # Health check endpoint
└── api/
    └── index.ts       # API v1 router
```

### Error Handling Middleware
- Create custom error class
- Global error handler middleware
- 404 handler for undefined routes
- Error response formatting:
  ```json
  {
    "error": {
      "message": "Error message",
      "status": 400,
      "timestamp": "ISO date"
    }
  }
  ```

### Database Setup
- Choose database: SQLite for development, PostgreSQL for production
- Install database client (e.g., `better-sqlite3` or `pg`)
- Create database connection utility
- Create database initialization script
- Set up database migrations structure

### Logging
- Set up structured logging (use `winston` or `pino`)
- Log HTTP requests and responses
- Log errors with stack traces
- Configure log levels based on environment

### API Response Standards
Create utility for consistent responses:
```typescript
// Success response
{
  "data": { /* response data */ },
  "timestamp": "ISO date"
}

// Error response
{
  "error": {
    "message": "Error message",
    "status": 400,
    "timestamp": "ISO date"
  }
}
```

## Frontend Tasks

### API Service Layer
- Create base Axios instance with default configuration
- Set base URL from environment variables
- Add request/response interceptors
- Create error handling for API calls

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptors for auth tokens, error handling, etc.
```

### Environment Configuration
- Create `.env.example` with required variables
- Set up Vite environment variable handling
- Document environment setup in README

### API Types
- Create TypeScript types for API responses
- Create types for error responses
- Share types between frontend and backend (consider moving to shared package)

## Testing Requirements

### Backend Tests (TDD - Write First!)
1. **Health Check Endpoint**
   - Test: `GET /health` returns 200 status
   - Test: Response includes `{ status: 'ok' }` and timestamp

2. **Error Handling**
   - Test: Undefined routes return 404 with proper error format
   - Test: Invalid JSON returns 400 with error message
   - Test: Server errors return 500 with error format

3. **CORS Configuration**
   - Test: CORS headers present in responses
   - Test: Preflight requests handled correctly

4. **Database Connection**
   - Test: Database connection succeeds
   - Test: Database initialization creates tables
   - Test: Connection failure is handled gracefully

### Frontend Tests (TDD - Write First!)
1. **API Service**
   - Test: API instance created with correct base URL
   - Test: Error responses properly formatted
   - Test: Timeout errors handled

2. **Environment Configuration**
   - Test: Environment variables loaded correctly
   - Test: Default values used when env vars missing

## Success Criteria

- [ ] Express app configured with all middleware
- [ ] Health check endpoint: `GET /health` returns 200 with status
- [ ] Error handling middleware catches and formats errors
- [ ] 404 handler for undefined routes implemented
- [ ] CORS configured for frontend communication
- [ ] Logging configured with appropriate log levels
- [ ] Database connection established and tested
- [ ] API response format standardized
- [ ] Frontend API service layer created
- [ ] All backend tests pass: `npm test --workspace=backend`
- [ ] All frontend tests pass: `npm test --workspace=frontend`
- [ ] Backend starts without errors: `npm run dev --workspace=backend`
- [ ] Frontend can connect to backend health endpoint

## Notes

- Keep middleware simple and focused
- Use environment variables for configuration
- Test error scenarios thoroughly
- Document API response formats in README
- Consider using a shared types package for TypeScript types

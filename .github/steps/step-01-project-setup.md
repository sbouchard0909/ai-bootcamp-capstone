# Step 1: Project Setup and Infrastructure

## Overview
Initialize the monorepo structure with frontend (React) and backend (Express) packages, configure build tools, testing frameworks, and development workflows.

## Backend Tasks

### Initialize Backend Package
- Create `packages/backend` directory structure
- Initialize npm package with TypeScript configuration
- Install dependencies:
  - Express, TypeScript, ts-node
  - Jest, Supertest for testing
  - ESLint, Prettier for code quality
  - Nodemon for development

### Backend Structure
```
packages/backend/
├── src/
│   ├── app.ts           # Express app configuration
│   ├── server.ts        # Server entry point
│   ├── routes/          # API route handlers
│   ├── models/          # Data models
│   ├── middleware/      # Custom middleware
│   └── utils/           # Utility functions
├── tests/               # Test files
├── package.json
├── tsconfig.json
└── jest.config.js
```

### Configuration Files
- TypeScript configuration for Node.js
- Jest configuration for testing
- ESLint configuration for code quality
- `.env.example` for environment variables

## Frontend Tasks

### Initialize Frontend Package
- Create `packages/frontend` directory structure
- Initialize React app with TypeScript
- Install dependencies:
  - React, React Router
  - Axios for API calls
  - React Testing Library, Vitest
  - TailwindCSS for styling
  - Playwright for UI tests

### Frontend Structure
```
packages/frontend/
├── src/
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   ├── pages/           # Page components
│   ├── components/      # Reusable components
│   ├── services/        # API service layer
│   ├── hooks/           # Custom React hooks
│   └── types/           # TypeScript types
├── tests/               # Test files
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Configuration Files
- Vite configuration for build and dev server
- Vitest configuration for testing
- TailwindCSS configuration
- Playwright configuration for UI tests

## Root Configuration

### Workspace Setup
- Root `package.json` with workspace configuration
- Shared ESLint and Prettier configurations
- Git hooks with Husky (optional)
- Scripts for running both packages

### Root Scripts
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --workspace=backend\" \"npm run dev --workspace=frontend\"",
    "test": "npm test --workspaces",
    "test:ui": "npm run test:ui --workspace=frontend",
    "lint": "npm run lint --workspaces",
    "build": "npm run build --workspaces"
  }
}
```

## Testing Requirements

### Backend Tests
- Test setup: Jest can initialize and run
- Test Express app: Basic health check endpoint returns 200
- Test TypeScript compilation: No type errors

### Frontend Tests
- Test setup: Vitest can initialize and run
- Test React rendering: App component renders without errors
- Test Playwright: Basic test can run and pass

## Success Criteria

- [ ] Monorepo structure created with `packages/backend` and `packages/frontend`
- [ ] Backend package initialized with TypeScript, Express, Jest, and Supertest
- [ ] Frontend package initialized with React, TypeScript, Vitest, and Playwright
- [ ] All dependencies installed without errors
- [ ] TypeScript compiles successfully in both packages
- [ ] Basic health check endpoint works: `GET /health` returns `{ status: 'ok' }`
- [ ] Backend tests run: `npm test --workspace=backend`
- [ ] Frontend tests run: `npm test --workspace=frontend`
- [ ] Lint checks pass: `npm run lint`
- [ ] Development servers start: `npm run dev`
- [ ] Basic Playwright test passes

## Notes

- Use npm workspaces for monorepo management
- Keep configurations minimal - extend as needed
- Ensure both packages can run independently
- Document setup steps in root README.md

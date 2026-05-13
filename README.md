# AI Bootcamp Capstone - Travel Planning App

A full-stack travel planning application for organizing vacation plans, tracking activities, and monitoring trip budgets.

## What You Can Do In The App

- Create an account, log in, and manage an authenticated session.
- Create, edit, and delete vacation plans.
- Set trip details for each plan:
  - Name and destination
  - Start and end dates
  - Budget and status
  - Optional description
- View all plans in a centralized plans list.
- Open a plan detail page to:
  - Add, edit, and delete activities
  - Track spending by activity
  - See budget utilization, remaining budget, and budget warnings
- Use the dashboard to view:
  - Welcome summary and quick stats
  - Upcoming, active, and completed trip groups
  - Total budget and total spent across plans
  - Quick actions to create or browse plans
- Automatically update plan status in dashboard flow:
  - upcoming/planning -> active when trip starts
  - active -> completed when trip ends

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: SQLite (better-sqlite3)
- Testing: Vitest + React Testing Library, Jest + Supertest, Playwright

## Project Structure

- packages/frontend: React client
- packages/backend: Express API
- docs: project and implementation guidelines

## Prerequisites

- Node.js 18+
- npm 9+

## How To Run Locally

1. Install dependencies from the repository root:

```bash
npm install
```

2. Start frontend and backend together (recommended):

```bash
npm run dev
```

3. Open the app:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health

## Default Development User

In non-production environments, the backend seeds a test account automatically:

- Email: test@example.com
- Password: password123

You can also register your own account from the UI.

## Useful Commands

From the repository root:

```bash
# Run all workspace tests
npm test

# Frontend unit/integration tests
npm test --workspace=frontend -- --run

# Backend tests
npm test --workspace=backend

# Frontend Playwright UI tests
npm run test:ui --workspace=frontend

# Lint all workspaces
npm run lint

# Build all workspaces
npm run build
```

## Environment Notes

- Frontend API URL defaults to http://localhost:5000.
- You can override it with VITE_API_URL.
- Backend JWT secret defaults to a development value when JWT_SECRET is not set.


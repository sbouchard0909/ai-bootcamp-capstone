# Testing Guidelines

## Overview
This document defines testing standards for the AI Bootcamp Capstone project. Follow these rules to keep tests reliable, maintainable, and consistent across frontend and backend code.

## General Principles

- All tests must be independent and isolated
- Tests must not rely on shared state from other tests
- All tests should succeed consistently on multiple runs
- Use setup and teardown hooks where needed (`beforeEach`, `afterEach`, `beforeAll`, `afterAll`)
- All new features must include appropriate tests
- Tests should be maintainable, readable, and follow best practices

## Unit Tests

- Use Jest for unit tests
- File naming convention: `*.test.js` or `*.test.ts`
- Test files should be named after the files they are testing
- Backend unit test location: `packages/backend/tests/unit`
- Frontend unit test location: `packages/frontend/tests/unit`

## Integration Tests

- Use Jest + Supertest to test backend endpoints with HTTP requests
- File naming convention: `*.test.js` or `*.test.ts`
- Test files should be named after the files/endpoints they are testing
- Integration test location: `packages/backend/tests/integration`

## End-to-End (E2E) Tests

- Use Playwright for complete UI workflow testing through browser automation
- File naming convention: `*.spec.js` or `*.spec.ts`
- Test files should be named after the workflow/file they are testing
- E2E test location: `packages/frontend/tests/e2e`
- Playwright tests must use one browser only
- Limit E2E coverage to 5-8 critical user journeys
- Focus on happy paths and key edge cases
- Use the Page Object Model (POM) pattern for maintainability

## Reliability and Isolation

- Ensure every test can run independently in any order
- Clean up test data and mocks after each test
- Avoid dependencies on wall-clock timing where possible
- Use deterministic test fixtures and stable selectors

## Port Configuration

Use environment variables for ports with sensible defaults:

- Frontend default port: `3000`
- Backend default port:

```javascript
const PORT = process.env.PORT || 3030;
```

# GitHub Copilot Instructions

> **Note**: This file is located at `.github/copilot-instructions.md` and is used by GitHub Copilot to understand project context.

This file contains high-level instructions for GitHub Copilot to follow when generating code for this project. For detailed guidance, refer to the documentation files in the `docs/` directory.

## Documentation Overview

The project documentation will be built during the bootcamp sessions.

- [Project Overview](../docs/project-overview.md) - Overview of the project
- [Functional Requirements](../docs/functional-requirements.md) - Detailed functional requirements for the application
- [UI Guidelines](../docs/ui-guidelines.md) - Design principles, color palette, typography, and component guidelines
- [Coding Guidelines](../docs/coding-guidelines.md) - Coding style, import organization, linting, and DRY principle
- [Testing Guidelines](../docs/testing-guidelines.md) - Unit, integration, and E2E testing standards and conventions

## Project Context

This is a full-stack travel planning application with a React frontend and an Express backend. Development follows an iterative, feedback-driven approach.

- **Current phase**: Initialize the project
- **Frontend**: React (packages/frontend)
- **Backend**: Node.js + Express (packages/backend)

## Development Principles

- **Test-driven development**: Follow the red-green-refactor cycle
- **Incremental changes**: Make small, testable modifications
- **Systematic debugging**: Use test failures as guides, not just symptoms
- **Validate before commit**: All tests must pass and there must be no lint errors before committing

## Testing Approach

- **Backend API changes**: Write Jest tests first, then implement (red-green-refactor)
- **Frontend component changes**: Write React Testing Library tests first for component behaviour, then implement
- **TDD rule**: Tests are written before implementation, always

## Testing Scope

This project uses unit tests, integration tests, and UI end-to-end tests:

- **Backend**: Jest + Supertest for API testing
- **Frontend**: React Testing Library for component unit/integration tests
- **UI testing**: Playwright for critical user journey automation
- **Manual testing**: Browser-based exploratory validation and visual checks
- **Reason**: Combine fast feedback (unit/integration) with end-to-end quality confidence (UI tests)

## Workflow Patterns

1. **TDD Workflow**: Write/fix tests → Run → Fail → Implement → Pass → Refactor
2. **Code Quality Workflow**: Run lint → Categorize issues → Fix systematically → Re-validate
3. **Integration Workflow**: Identify issue → Debug → Test → Fix → Verify end-to-end
4. **UI Testing Workflow**: Define critical journeys → Create UI tests → Run → Debug failures → Validate coverage

## Agent Usage

Use the appropriate specialized agent for each task:

- **tdd-developer**: Implementation and unit/integration TDD cycles. Do NOT create or run Playwright UI tests in this mode
- **code-reviewer**: Addressing lint errors and code quality improvements
- **test-engineer**: Owns all Playwright UI test authoring/execution, failure triage, and isolation checks

## Workflow Utilities

GitHub CLI commands for workflow automation (available to all modes):

- List open issues: `gh issue list --state open`
- Get issue details: `gh issue view <issue-number>`
- Get issue with comments: `gh issue view <issue-number> --comments`
- The main exercise issue will have "Exercise:" in the title
- Steps are posted as comments on the main issue
- Use these commands when `/execute-step` or `/validate-step` prompts are invoked

## Git Workflow

- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, etc.
- Feature branches: `feature/<descriptive-name>`
- Always stage all changes before committing: `git add .`
- Push to the correct branch: `git push origin <branch-name>`
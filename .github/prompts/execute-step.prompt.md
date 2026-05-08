---
description: "Execute instructions from the current GitHub Issue step"
agent: "tdd-developer"
tools: ['search', 'read', 'edit', 'execute', 'web', 'todo']
---

# Execute Step

Execute the current step instructions from the GitHub Issue systematically using Test-Driven Development practices.

## Inputs

**Issue Number** (optional): ${input:issue-number:GitHub Issue number (leave blank to auto-detect exercise issue)}

## Instructions

### 1. Find the Exercise Issue

If issue number not provided:
- Use `gh issue list --state open` to find the exercise issue
- The main exercise issue has "Exercise:" in the title
- Extract the issue number

### 2. Get Issue Content

Retrieve the full issue with comments:
```bash
gh issue view <issue-number> --comments
```

### 3. Parse Step Instructions

- Locate the latest step in the issue comments
- Identify all `:keyboard: Activity:` sections in that step
- Extract the specific instructions for each activity

### 4. Execute Activities Systematically

For each activity:

**Follow TDD Principles**:
- Write tests FIRST for new features (RED phase)
- Implement minimal code to pass tests (GREEN phase)
- Refactor while keeping tests green (REFACTOR phase)
- Run tests after each change

**Scope Boundaries**:
- ✅ Implement backend API changes with Jest + Supertest tests
- ✅ Implement frontend components with React Testing Library tests
- ✅ Write unit and integration tests
- ❌ Do NOT create Playwright UI tests (use `/create-ui-tests` instead)
- ❌ Do NOT run Playwright UI tests (use `/run-ui-tests` instead)

**Execution Approach**:
- Break work into small, testable increments
- Run tests continuously to validate progress
- Track progress with todo list
- Document key findings in working notes

### 5. Complete Activities

**After completing all activities**:
- Verify all tests pass: `npm test`
- Check for compilation errors
- Do NOT commit or push changes (use `/commit-and-push` instead)

### 6. Determine Next Steps

**If the step requires UI workflow**:
Provide these commands in order:
1. `/create-ui-tests` - Create Playwright UI tests for critical journeys
2. `/run-ui-tests` - Run UI tests and validate failures
3. `/validate-step {step-number}` - Validate success criteria

**If UI workflow is NOT required**:
Provide this command:
1. `/validate-step {step-number}` - Validate success criteria

**IMPORTANT**: Never recommend `/validate-step` before completing required UI prompts.

## Success Indicators

- ✅ All activities in the step completed
- ✅ Tests written first for new features (TDD)
- ✅ All unit and integration tests passing
- ✅ No compilation errors
- ✅ Changes ready for validation
- ✅ Next commands clearly provided

## Notes

- This prompt uses the `tdd-developer` agent automatically
- Inherits gh CLI knowledge from `.github/copilot-instructions.md`
- Focus on TDD: test first, code second
- Keep changes incremental and well-tested
- Separate concerns: implementation here, UI tests in `/create-ui-tests`, validation in `/validate-step`

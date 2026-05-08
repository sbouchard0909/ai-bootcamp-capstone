---
description: "Create UI tests for required critical user journeys"
agent: "test-engineer"
tools: ['search', 'read', 'edit', 'execute', 'todo']
---

# Create UI Tests

Create Playwright UI end-to-end tests for critical user journeys using Page Object Model patterns.

## Inputs

**Journeys** (optional): ${input:journeys:Comma-separated list of journeys to test (leave blank for default: create, edit, toggle, delete, error-handling)}

## Instructions

### 1. Determine Test Scope

**Default journeys** (if not specified):
- Create: User creates a new entity
- Edit: User updates existing entity
- Toggle: User changes entity state
- Delete: User removes entity
- Error handling: Core error-state flows

**HARD LIMIT**: Create a maximum of 5 Playwright tests for this run (target 3-5 total).

**Requirements**:
- Include at least 1 error-path test within the 3-5 total
- If more than 5 candidate scenarios exist, select the highest-risk 5
- List any deferred scenarios instead of creating more tests

### 2. Review Existing Tests

Check for existing UI tests:
```bash
find tests -name "*.spec.ts" -type f
# or
find e2e -name "*.spec.ts" -type f
```

Avoid duplicating existing test coverage.

### 3. Design Page Objects

**Apply Page Object Model (POM)**:

**Structure**:
```
tests/
├── pages/              # Page object classes
│   ├── BasePage.ts    # Shared behaviors
│   └── FeaturePage.ts # Feature-specific interactions
└── e2e/               # Test scenarios
    └── feature.spec.ts # Test cases
```

**Page Object Principles**:
- Encapsulate selectors and UI interactions in page classes
- Return elements or data for test assertions
- Keep test files focused on scenario intent
- No duplicate selectors across tests

**Example Page Object**:
```typescript
// pages/TripsPage.ts
export class TripsPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/trips');
    await this.page.waitForLoadState('networkidle');
  }
  
  async createTrip(name: string, startDate: string, endDate: string) {
    await this.page.getByRole('button', { name: 'Create Trip' }).click();
    await this.page.getByLabel('Trip Name').fill(name);
    await this.page.getByLabel('Start Date').fill(startDate);
    await this.page.getByLabel('End Date').fill(endDate);
    
    const responsePromise = this.page.waitForResponse('/api/trips');
    await this.page.getByRole('button', { name: 'Save' }).click();
    await responsePromise;
  }
  
  async getTripByName(name: string) {
    return this.page.getByRole('article', { name });
  }
}
```

### 4. Use Stable Selectors

**Selector Priority** (highest to lowest):
1. Accessibility roles: `getByRole('button', { name: 'Create' })`
2. Labels: `getByLabel('Trip Name')`
3. Test IDs: `getByTestId('trip-card')`
4. Text content: `getByText('No trips found')` (sparingly)
5. CSS selectors: AVOID - brittle

**Add test IDs** if needed:
```tsx
<div data-testid="trip-card">
  {/* content */}
</div>
```

### 5. Implement State-Based Waits

**Use state-based waits, NOT arbitrary timeouts**:

```typescript
// ✅ Good: Wait for state
await page.waitForLoadState('networkidle');
await expect(element).toBeVisible();
await page.waitForResponse('/api/trips');
await page.waitForURL('/trips');

// ❌ Bad: Arbitrary timeout
await page.waitForTimeout(3000);
```

### 6. Write Test Scenarios

**Keep tests focused on behavior**:

```typescript
// e2e/trip-crud.spec.ts
import { test, expect } from '@playwright/test';
import { TripsPage } from '../pages/TripsPage';

test.describe('Trip CRUD Operations', () => {
  let tripsPage: TripsPage;
  
  test.beforeEach(async ({ page }) => {
    tripsPage = new TripsPage(page);
    await tripsPage.goto();
  });
  
  test('should create a new trip', async ({ page }) => {
    await tripsPage.createTrip('Tokyo Adventure', '2026-06-01', '2026-06-10');
    
    const trip = await tripsPage.getTripByName('Tokyo Adventure');
    await expect(trip).toBeVisible();
  });
  
  test('should display error for invalid date range', async ({ page }) => {
    await tripsPage.createTripWithInvalidDates('Invalid Trip', '2026-06-10', '2026-06-01');
    
    await expect(page.getByText(/end date must be after start date/i)).toBeVisible();
  });
});
```

### 7. Ensure Test Isolation

**Each test should be independent**:
- No shared state between tests
- Fresh setup in `beforeEach`
- Self-contained test data
- Don't rely on execution order

### 8. Verify Test Count

**Before finishing**:
- Count the number of `test(...)` or `it(...)` blocks created
- Ensure total is ≤ 5 Playwright tests
- If over the limit, reduce to the highest-priority 5
- List any deferred scenarios

**IMPORTANT**: Do not claim "small scope" if more than 5 tests were created.

### 9. Report Results

Provide summary:
```markdown
## UI Tests Created

### Files Created/Modified
- `tests/pages/TripsPage.ts` - Page object for trip interactions
- `tests/e2e/trip-crud.spec.ts` - CRUD operations (3 tests)
- `tests/e2e/trip-errors.spec.ts` - Error handling (2 tests)

### Test Scenarios Covered (5 total)
1. ✅ Create trip with valid data
2. ✅ Edit existing trip
3. ✅ Delete trip with confirmation
4. ✅ Display error for invalid date range
5. ✅ Display error for missing required fields

### Deferred Scenarios (if applicable)
- Toggle trip completion status
- Filter trips by date range

### Next Steps
1. Run `/run-ui-tests` to execute and validate tests
2. Fix any failures identified
3. Run `/validate-step {step-number}` to confirm completion
```

## Success Indicators

- ✅ Journeys identified (default or user-specified)
- ✅ Page objects created with reusable interactions
- ✅ Test files created with focused scenarios
- ✅ Stable selectors used (roles, labels, test IDs)
- ✅ State-based waits implemented (no arbitrary timeouts)
- ✅ Tests are isolated and independent
- ✅ Maximum 5 Playwright tests created
- ✅ At least 1 error-path test included
- ✅ Test count verified and within limit
- ✅ Clear report of coverage provided

## Notes

- This prompt uses the `test-engineer` agent automatically
- Follows Page Object Model (POM) best practices
- Enforces HARD LIMIT of 5 Playwright tests maximum
- Prioritizes high-risk scenarios if scope must be reduced
- Tests should be deterministic and debuggable
- Run `/run-ui-tests` after creating tests to validate

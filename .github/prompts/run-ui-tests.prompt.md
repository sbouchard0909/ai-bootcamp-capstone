---
description: "Run UI tests and summarize failures"
agent: "test-engineer"
tools: ['read', 'execute', 'todo']
---

# Run UI Tests

Execute Playwright UI end-to-end tests and provide a structured summary of results with failure analysis.

## Instructions

### 1. Install Playwright Dependencies (REQUIRED FIRST STEP)

**CRITICAL for Ubuntu/Linux environments**:

Before running UI tests, ALWAYS run:
```bash
npm run test:ui:install --workspace=frontend
```

**What this does**:
- Runs `playwright install --with-deps chromium`
- Includes automatic bounded Ubuntu repository remediation for common Yarn GPG key issues
- Performs one retry if initial install fails
- Required after container rebuild or fresh environment setup

**If install fails**:
- STOP immediately
- Do NOT attempt ad-hoc package hunting or broad OS troubleshooting
- Report as an environment blocker with:
  - The failing command
  - Key error lines from output
  - Recommendation to check environment configuration

### 2. Ensure Services Are Running

**Backend and frontend must be running** before executing UI tests.

**Check if services are running**:
```bash
# Check for running processes
ps aux | grep -E "node|npm"
# or check specific ports
lsof -i :3000  # frontend
lsof -i :5000  # backend (or your backend port)
```

**If not running, start from repository root**:
```bash
npm start
```

Wait for both services to be ready before proceeding.

### 3. Run UI Tests

Execute Playwright tests using the project command:
```bash
npm run test:ui
# or
npx playwright test
```

**For debugging**:
```bash
npx playwright test --headed    # Show browser
npx playwright test --debug     # Debug mode
npx playwright test --ui        # Playwright UI mode
```

### 4. Capture Test Output

Collect:
- Total tests run
- Number passed
- Number failed
- Test execution time
- Error messages for failures
- Stack traces for failures

### 5. Summarize Results

Provide a clear, structured summary:

```markdown
## UI Test Execution Report

### Summary
- Total Tests: X
- ✅ Passed: Y
- ❌ Failed: Z
- Execution Time: N seconds

### Test Results

#### ✅ Passing Tests
- Trip creation with valid data
- Trip editing functionality
- Trip deletion with confirmation

#### ❌ Failing Tests

##### 1. Display error for invalid date range
**File**: `tests/e2e/trip-errors.spec.ts:45`
**Error**:
```
Error: expect(received).toBeVisible()
Expected element to be visible, but it was not found.

Selector: role=alert[name="End date must be after start date"]
```

**Classification**: 🔴 **Application Code Issue**

**Analysis**:
- Test expects validation error message to be displayed
- Error message element not found in DOM
- Application is not showing validation feedback

**Recommended Fix**:
- Add error message display in TripForm component
- Ensure validation runs on form submission
- Show user-friendly error message for invalid date range
- File to modify: `packages/frontend/src/components/TripForm.tsx`

---

##### 2. Toggle trip completion status
**File**: `tests/e2e/trip-state.spec.ts:28`
**Error**:
```
TimeoutError: locator.click: Target closed
Timeout 30000ms exceeded
```

**Classification**: 🟡 **Test Code Issue**

**Analysis**:
- Test timing issue - clicking before element is ready
- Missing wait for element to be actionable
- Not waiting for page navigation to complete

**Recommended Fix**:
- Add explicit wait before clicking toggle button
- Use state-based wait: `await expect(toggleButton).toBeEnabled()`
- Wait for navigation if toggle redirects: `await page.waitForURL('/trips')`
- File to modify: `tests/pages/TripsPage.ts`

---

### Overall Status
- ❌ Some tests failing - see recommendations above

### Next Steps
1. Fix application code issues (🔴)
2. Fix test code issues (🟡)
3. Re-run UI tests to verify: `npm run test:ui`
4. Once all tests pass, run `/validate-step {step-number}`
```

### 6. Classify Failures

For each failure, classify into one of three categories:

#### 🔴 Application Code Issue
**Indicators**:
- Expected behavior doesn't happen
- API returns wrong response
- UI element missing that should be present
- Error message not displayed
- State doesn't update after action

**Action**: Fix application code

#### 🟡 Test Code Issue
**Indicators**:
- Timeout errors due to missing waits
- Flaky tests (pass/fail intermittently)
- Incorrect selectors
- Wrong test assumptions
- Test setup incomplete

**Action**: Fix test code

#### 🔵 Environment Issue
**Indicators**:
- Tests fail in CI but pass locally (or vice versa)
- Database connection errors
- Network timeouts
- Browser installation issues
- Missing environment variables

**Action**: Fix environment configuration

### 7. Provide Actionable Recommendations

For each failure:
- Explain what the test expected
- Explain what actually happened
- Classify the root cause
- Specify which file(s) to modify
- Suggest the specific fix needed

### 8. Generate Test Report

If available, generate and show HTML report:
```bash
npx playwright show-report
```

## Success Indicators

- ✅ Playwright dependencies installed successfully
- ✅ Backend and frontend services running
- ✅ UI tests executed
- ✅ Results summarized clearly
- ✅ Failures classified by root cause
- ✅ Actionable recommendations provided
- ✅ Next steps clearly stated

## Failure Handling

### If install fails (after retry):
- STOP immediately
- Report environment blocker
- Do NOT proceed with test execution
- Provide error details for troubleshooting

### If services not running:
- Start services with `npm start`
- Wait for ready state
- Then run tests

### If all tests fail:
- Check if application is properly built
- Verify environment variables
- Check database connection
- Consider environment issue

### If tests are flaky:
- Look for missing state-based waits
- Check for race conditions
- Review test isolation
- Consider test code issue

## Example Report

```markdown
## UI Test Execution Report

### Summary
- Total Tests: 5
- ✅ Passed: 3
- ❌ Failed: 2
- Execution Time: 12.4 seconds

### Failures

#### 1. Display error for invalid date range (🔴 Application Code)
**Issue**: Validation error message not displayed
**Fix**: Add error message to TripForm component when endDate < startDate

#### 2. Toggle trip status (🟡 Test Code)
**Issue**: Test clicks button before it's ready
**Fix**: Add `await expect(button).toBeEnabled()` before clicking

### Next Steps
1. Fix application code: Add validation error display
2. Fix test code: Add proper wait before toggle click
3. Re-run: `npm run test:ui`
4. Once passing: `/validate-step 5-1`
```

## Notes

- This prompt uses the `test-engineer` agent automatically
- Always run `test:ui:install` first in Ubuntu/Linux environments
- Bounded remediation included for common Yarn key issue
- Ensure backend and frontend are running before tests
- Classify failures to guide fixes
- Provide specific, actionable recommendations
- Re-run tests after fixes to verify resolution

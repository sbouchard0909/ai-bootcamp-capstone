---
description: "Validate that all success criteria for the current step are met"
agent: "code-reviewer"
tools: ['search', 'read', 'execute', 'web', 'todo']
---

# Validate Step

Validate that all success criteria for the specified step are met by checking the current workspace state.

## Inputs

**Step Number** (REQUIRED): ${input:step-number:Step number to validate (e.g., "5-0", "5-1")}

## Instructions

### 1. Validate Input

- Ensure step number is provided in format "X-Y" (e.g., "5-0", "5-1")
- If not provided, STOP and ask the user for the step number

### 2. Find the Exercise Issue

Use gh CLI to locate the main exercise issue:
```bash
gh issue list --state open
```

Look for the issue with "Exercise:" in the title and extract the issue number.

### 3. Get Issue Content

Retrieve the full issue with all comments:
```bash
gh issue view <issue-number> --comments
```

### 4. Locate the Step

Search through the issue content to find:
```
# Step ${step-number}:
```

Extract the complete step content including all sections.

### 5. Extract Success Criteria

Find the "Success Criteria" section within the step. This section lists all requirements that must be met, typically formatted as:
```markdown
## Success Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
```

### 6. Validate Each Criterion

For each success criterion:

**Check Existence**:
- Files mentioned should exist
- Code mentioned should be implemented
- Tests mentioned should be present

**Check Functionality**:
- Run tests to verify they pass: `npm test`
- Check for compilation errors
- Verify no linting errors in changed files

**Check Completeness**:
- All required features implemented
- All edge cases handled
- Error messages appropriate
- Documentation updated if needed

### 7. Report Status

Provide a structured report:

```markdown
## Validation Report: Step ${step-number}

### Summary
- Total Criteria: X
- ✅ Met: Y
- ❌ Not Met: Z

### Detailed Results

#### ✅ Criterion 1: [Description]
**Status**: PASSED
**Evidence**: [Specific files, test results, or commands run]

#### ❌ Criterion 2: [Description]
**Status**: FAILED
**Issue**: [What's missing or incorrect]
**Fix**: [Specific guidance to resolve]

### Overall Status
- [ ] Step is COMPLETE (all criteria met)
- [x] Step is INCOMPLETE (see failures above)

### Next Steps
[Specific actions needed to complete the step]
```

### 8. Provide Guidance

**If all criteria met**:
- Congratulate completion
- Suggest running `/commit-and-push <branch-name>` if not already committed
- Mention next step if visible in the issue

**If criteria not met**:
- List specific failures
- Provide actionable fix guidance
- Suggest which files to modify
- Recommend commands to run

## Success Indicators

- ✅ Step number provided and valid
- ✅ Exercise issue found
- ✅ Step content located
- ✅ Success criteria extracted
- ✅ All criteria checked against workspace
- ✅ Clear status report provided
- ✅ Actionable guidance given for any failures

## Example Validation

```markdown
## Validation Report: Step 5-1

### Summary
- Total Criteria: 3
- ✅ Met: 2
- ❌ Not Met: 1

### Detailed Results

#### ✅ Trip creation API endpoint implemented
**Status**: PASSED
**Evidence**: 
- File exists: `packages/backend/src/routes/trips.ts`
- POST /api/trips endpoint implemented
- Tests pass: `npm test tripService.test.ts`

#### ✅ Tests written and passing
**Status**: PASSED
**Evidence**:
- Test file exists: `packages/backend/tests/tripService.test.ts`
- All tests passing: 8/8
- Coverage > 80%

#### ❌ Input validation with error handling
**Status**: FAILED
**Issue**: Missing validation for invalid date range
**Fix**: 
- Add validation in `packages/backend/src/routes/trips.ts`
- Check that endDate > startDate
- Return 400 with error message if invalid
- Add test case for this scenario

### Overall Status
- [x] Step is INCOMPLETE (1 criterion not met)

### Next Steps
1. Add date range validation to trip creation endpoint
2. Add test for invalid date range
3. Run tests to verify: `npm test`
4. Re-run `/validate-step 5-1` to confirm
```

## Notes

- This prompt uses the `code-reviewer` agent automatically
- Inherits gh CLI knowledge from `.github/copilot-instructions.md`
- Performs systematic validation of success criteria
- Provides specific, actionable guidance
- Should be run AFTER `/execute-step` and any required UI workflows

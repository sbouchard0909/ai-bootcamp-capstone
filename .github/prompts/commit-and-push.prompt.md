---
description: "Analyze changes, generate commit message, and push to feature branch"
tools: ['read', 'execute', 'todo']
---

# Commit and Push

Analyze changes, generate a conventional commit message, and push to the specified feature branch.

## Inputs

**Branch Name** (REQUIRED): ${input:branch-name:Feature branch name (e.g., feature/add-trips-api)}

## Instructions

### 1. Validate Branch Name

- Ensure branch name is provided
- If not provided, STOP and ask the user for the branch name
- Branch should follow pattern: `feature/<descriptive-name>`

### 2. Check for Required UI Tests

**If the current step includes required UI workflow**:
- Verify UI tests have been run successfully in this chat session
- If not, run: `npm run test:ui`
- If UI tests fail, STOP and recommend fixing failures before committing
- Do not proceed with commit if UI tests are required but failing

### 3. Analyze Changes

Review all changes:
```bash
git status
git diff --staged
git diff
```

Identify:
- Files modified
- Type of changes (features, fixes, refactoring, docs)
- Scope of changes (backend, frontend, both)

### 4. Generate Commit Message

Use conventional commit format:

**Format**:
```
<type>: <short summary>

<optional body with details>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `chore`: Maintenance tasks
- `style`: Code style changes

**Example**:
```
feat: add trip creation API endpoint

- Implement POST /api/trips with validation
- Add Jest + Supertest integration tests
- Validate date range and required fields
- Return 201 with created trip data
```

### 5. Create or Switch to Branch

**If branch doesn't exist**:
```bash
git checkout -b <branch-name>
```

**If branch exists**:
```bash
git checkout <branch-name>
```

**CRITICAL**: 
- Do NOT commit to `main` branch
- Do NOT commit to any branch except the user-provided branch name
- Only use the branch name provided by the user

### 6. Stage, Commit, and Push

```bash
# Stage all changes
git add .

# Commit with generated message
git commit -m "<commit message>"

# Push to feature branch
git push origin <branch-name>
```

### 7. Confirm Success

Report:
- Branch name
- Commit message
- Files changed
- Next steps (e.g., "Ready to create pull request")

## Success Indicators

- ✅ Branch name provided
- ✅ UI tests passed (if required)
- ✅ Changes analyzed
- ✅ Commit message follows conventions
- ✅ Branch created or switched successfully
- ✅ Changes staged and committed
- ✅ Changes pushed to remote branch
- ✅ NOT committed to main branch

## Notes

- This prompt works with any active agent
- Inherits Git workflow knowledge from `.github/copilot-instructions.md`
- Always use conventional commit format
- Never commit directly to main
- Run UI tests if step requires them
- Keep commit messages descriptive and specific

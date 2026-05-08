# Development Memory System

## Purpose

This directory contains a working memory system for tracking patterns, decisions, and lessons learned during development. It helps AI assistants provide better context-aware suggestions and enables developers to maintain continuity across sessions.

## Memory Types

### Persistent Memory
Located in `.github/copilot-instructions.md` - contains:
- Foundational development principles
- Workflow patterns
- Testing standards
- Agent configurations
- Git workflow guidelines

**When to use**: For established, unchanging project guidelines that apply across all development work.

### Working Memory
Located in `.github/memory/` - contains:
- Historical session summaries
- Discovered code patterns
- Active session notes
- Context-specific learnings

**When to use**: For discoveries, decisions, and patterns that emerge during development and need to be tracked or referenced later.

## Directory Structure

```
.github/memory/
├── README.md                    # This file - explains the memory system
├── session-notes.md             # Historical session summaries (committed)
├── patterns-discovered.md       # Accumulated code patterns (committed)
└── scratch/                     # Active session work (not committed)
    ├── .gitignore               # Ignores all files in scratch/
    └── working-notes.md         # Active session notes (ephemeral)
```

## File Purposes

### session-notes.md (Committed to Git)
**Purpose**: Historical record of completed development sessions

**Contents**:
- Session name and date
- What was accomplished
- Key findings and decisions
- Outcomes

**When to update**:
- At the end of each development session
- After completing a significant feature or bugfix
- When wrapping up a TDD cycle or debugging session

**How AI uses it**: Provides context about past work, decisions made, and rationale for implementation choices.

### patterns-discovered.md (Committed to Git)
**Purpose**: Document recurring code patterns and conventions discovered in the codebase

**Contents**:
- Pattern name and context
- Problem it solves
- Solution approach
- Code examples
- Related files

**When to update**:
- When discovering a new coding pattern in the codebase
- After resolving a bug that reveals a best practice
- When establishing a new convention during code review

**How AI uses it**: Ensures consistent code patterns across the codebase and helps avoid repeating past mistakes.

### scratch/working-notes.md (NOT Committed to Git)
**Purpose**: Active note-taking during current development session

**Contents**:
- Current task and approach
- Key findings as you work
- Decisions being made
- Blockers encountered
- Next steps
- General observations

**When to update**:
- Throughout active development work
- During TDD cycles (red-green-refactor notes)
- While debugging (hypotheses, findings)
- During code review feedback cycles
- When running lint fixes

**How AI uses it**: Provides immediate context about what you're currently working on, helping maintain focus and continuity within a session.

**At session end**: Review working-notes.md and extract key findings into session-notes.md, then clear or archive working-notes.md for the next session.

## Workflow Integration

### TDD Workflow
1. **Starting a TDD cycle**: Note the feature/test in `scratch/working-notes.md` under "Current Task"
2. **During red-green-refactor**: Document test failures, implementation decisions, and refactoring insights in "Key Findings"
3. **Discovering patterns**: If you notice a recurring pattern (e.g., service initialization), add it to `patterns-discovered.md`
4. **Session end**: Summarize the TDD cycle outcomes in `session-notes.md`

### Code Quality/Linting Workflow
1. **Before running lint**: Note in `scratch/working-notes.md` what areas need cleanup
2. **During fixes**: Document systematic approaches (e.g., "fix all import ordering first, then unused vars")
3. **After completion**: If a pattern emerges (e.g., common linting mistakes), add to `patterns-discovered.md`
4. **Session end**: Summarize lint fixes and any code quality improvements in `session-notes.md`

### Debugging Workflow
1. **Problem identified**: Document the issue in `scratch/working-notes.md` under "Current Task"
2. **Investigation**: Track hypotheses, test results, and findings in "Key Findings"
3. **Blockers**: Note any blockers or questions in "Blockers" section
4. **Resolution**: Document the solution and why it worked in "Decisions Made"
5. **Pattern recognition**: If the bug reveals a pattern (e.g., null handling), add to `patterns-discovered.md`
6. **Session end**: Summarize the debugging journey and resolution in `session-notes.md`

### Integration Testing Workflow
1. **Test planning**: Note planned integration scenarios in `scratch/working-notes.md`
2. **Failures**: Document integration failures and their root causes in "Key Findings"
3. **Fixes**: Track cross-component fixes and their impact in "Decisions Made"
4. **Patterns**: If integration reveals API or component interaction patterns, add to `patterns-discovered.md`
5. **Session end**: Summarize integration test outcomes in `session-notes.md`

## How AI Reads and Applies Memory

### During Development Sessions
1. **Context loading**: AI reads `session-notes.md` and `patterns-discovered.md` at session start
2. **Pattern application**: AI applies discovered patterns when suggesting code
3. **Active tracking**: AI can reference `scratch/working-notes.md` for immediate context
4. **Consistency**: AI ensures new code follows established patterns

### When Providing Suggestions
- **Code generation**: Uses patterns from `patterns-discovered.md` to maintain consistency
- **Problem solving**: References past sessions in `session-notes.md` for similar issues
- **Decision making**: Applies lessons learned from previous debugging sessions
- **Best practices**: Suggests approaches that align with discovered patterns

### Context Awareness
AI assistants can:
- Avoid repeating past mistakes documented in session notes
- Apply proven solutions from patterns-discovered.md
- Maintain continuity by referencing working-notes.md
- Suggest related patterns when you encounter similar problems

## Best Practices

### Be Concise
- Use bullet points and short phrases
- Focus on key insights, not verbose explanations
- Link to relevant files instead of duplicating code

### Be Specific
- Include file paths when referencing code
- Note exact error messages or test failures
- Document the "why" behind decisions

### Be Organized
- Keep working-notes.md focused on current work
- Archive completed work to session-notes.md
- Group related patterns in patterns-discovered.md

### Be Consistent
- Use the templates provided in each file
- Update files as you work, not just at session end
- Review and refine patterns as you learn more

## Example Usage Scenario

**Scenario**: Implementing a new trip service endpoint with TDD

1. **Session start**: 
   - Note in `scratch/working-notes.md`: "Current Task: Implement POST /api/trips endpoint"
   - Check `patterns-discovered.md` for service initialization patterns

2. **During TDD**:
   - Red phase: "Test failing: trip service returns 400 for invalid dates"
   - Green phase: "Added date validation using Joi schema"
   - Refactor: "Extracted validation to reusable middleware"
   - Document in "Key Findings": "Validation middleware pattern is reusable"

3. **Pattern discovery**:
   - Add to `patterns-discovered.md`: "Validation Middleware Pattern" with example

4. **Session end**:
   - Add to `session-notes.md`: Summary of trip endpoint implementation
   - Clear or archive `scratch/working-notes.md`

5. **Next session**:
   - AI reads session-notes.md and sees trip endpoint work
   - AI reads patterns-discovered.md and suggests validation middleware for next endpoint
   - You start fresh in working-notes.md with new task

## Summary

The memory system creates a feedback loop:
1. **Active work** → documented in `scratch/working-notes.md` (ephemeral)
2. **Key findings** → summarized in `session-notes.md` (historical)
3. **Patterns** → extracted to `patterns-discovered.md` (reusable)
4. **Future work** → AI applies these patterns automatically

This ensures your development maintains continuity, consistency, and continuous improvement across sessions.

# Patterns Discovered

> **Purpose**: Document recurring code patterns and conventions discovered in the codebase. This file is committed to git and helps maintain consistency across the project.

## Pattern Template

Use this template when documenting a new pattern:

```markdown
## [Pattern Name]

**Context**: [When/where this pattern applies]

**Problem**: [What problem does this pattern solve?]

**Solution**: [How does this pattern solve it?]

**Example**:
```[language]
// Example code demonstrating the pattern
```

**Related Files**:
- [path/to/file1.ts](path/to/file1.ts)
- [path/to/file2.ts](path/to/file2.ts)

**Notes**: [Additional considerations, trade-offs, or variations]
```

---

## Service Initialization Pattern

**Context**: When initializing service classes that maintain collections or state

**Problem**: Services need consistent initialization of internal state. Using `null` or `undefined` requires null checks throughout the code, while empty collections are immediately usable.

**Solution**: Initialize collection properties (arrays, objects, Maps, Sets) with empty values rather than null/undefined. This enables immediate use without null checking and follows the Null Object pattern.

**Example**:
```typescript
// ✅ Good: Initialize with empty array
class TripService {
  private trips: Trip[] = [];
  
  getAll(): Trip[] {
    return this.trips; // Always returns array, safe to iterate
  }
  
  add(trip: Trip): void {
    this.trips.push(trip); // No null check needed
  }
}

// ❌ Avoid: Initialize with null
class TripService {
  private trips: Trip[] | null = null;
  
  getAll(): Trip[] {
    return this.trips ?? []; // Requires null coalescing
  }
  
  add(trip: Trip): void {
    if (!this.trips) {
      this.trips = [];
    }
    this.trips.push(trip); // Requires null check
  }
}
```

**Related Files**:
- (To be added as services are implemented)

**Notes**: 
- This pattern applies to Arrays, Maps, Sets, and plain objects used as collections
- For single optional values (e.g., currentUser), null/undefined may still be appropriate
- Consider the semantic difference: empty array means "no items yet", null means "not initialized"

---

## [Your Next Pattern]

**Context**: [Add your pattern context]

**Problem**: [Add the problem]

**Solution**: [Add the solution]

**Example**:
```typescript
// Add your example code
```

**Related Files**:
- [Add related files]

**Notes**: [Add notes]

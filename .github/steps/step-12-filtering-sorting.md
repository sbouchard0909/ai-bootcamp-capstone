# Step 12: Filtering and Sorting Features

## Overview
Implement filtering and sorting capabilities for vacation plans with search functionality and customizable views.

## Backend Tasks

### Query Parameters Support
Enhance GET /api/plans endpoint to support:
```typescript
// GET /api/plans?status=upcoming&sortBy=startDate&order=asc&search=tokyo
interface PlansQuery {
  status?: 'planning' | 'upcoming' | 'active' | 'completed' | 'cancelled';
  sortBy?: 'startDate' | 'endDate' | 'budget' | 'name' | 'createdAt';
  order?: 'asc' | 'desc';
  search?: string;  // Search in name, destination, description
}
```

### Filtering Logic
- Filter by status (multiple statuses supported)
- Filter by date range (startDate, endDate)
- Filter by budget range (min, max)
- Search across name, destination, and description

### Sorting Logic
- Sort by start date (default)
- Sort by end date
- Sort by budget
- Sort by name (alphabetical)
- Sort by created date
- Support ascending/descending order

### Search Implementation
- Case-insensitive search
- Search in plan name, destination, and description
- Support partial matches
- Return relevance-sorted results

## Frontend Tasks

### Filter Controls Component
Create filtering UI:
- Status filter (checkboxes or chips)
- Date range picker (start/end)
- Budget range slider or inputs
- Search input with debouncing
- "Clear Filters" button

### Sort Controls Component
Create sorting UI:
- Sort dropdown or radio buttons:
  - Start Date
  - End Date
  - Budget
  - Name
  - Recently Created
- Order toggle (ascending/descending)
- Visual indicator of current sort

### Plans List Enhancement
Update plans list to support filtering/sorting:
- Apply filters from query params
- Update URL with filter/sort params
- Preserve filters across navigation
- Show active filters summary
- Results count display

### Search Bar Component
Implement search functionality:
- Search input with icon
- Debounced API calls (300ms delay)
- Clear search button
- Search suggestions (optional)
- Highlight matches in results

### Filter Pills/Tags
Display active filters as removable pills:
- Show applied filters
- Click to remove individual filter
- "Clear All" to remove all filters
- Update results immediately

### URL State Management
Sync filters with URL:
- Use query parameters for filters
- Enable browser back/forward
- Shareable filtered URLs
- Restore filters from URL on load

### Empty Results State
Handle no results gracefully:
- "No plans found" message
- Show applied filters
- Suggest removing filters
- Option to create new plan

## Testing Requirements

### Backend Tests (TDD - Write First!)

**Filtering**
1. Test: Filter by status returns only matching plans
2. Test: Filter by multiple statuses works (OR logic)
3. Test: Filter by date range returns plans within range
4. Test: Filter by budget range returns plans within range
5. Test: Multiple filters work together (AND logic)
6. Test: Invalid filter values handled gracefully

**Sorting**
1. Test: Sort by startDate ascending returns correctly ordered plans
2. Test: Sort by startDate descending returns correctly ordered plans
3. Test: Sort by budget works correctly
4. Test: Sort by name works alphabetically
5. Test: Default sort is startDate descending
6. Test: Invalid sort parameters ignored

**Search**
1. Test: Search finds plans by name
2. Test: Search finds plans by destination
3. Test: Search finds plans by description
4. Test: Search is case-insensitive
5. Test: Search handles partial matches
6. Test: Empty search returns all plans
7. Test: Search with no results returns empty array

**Combined Operations**
1. Test: Filter, sort, and search work together
2. Test: Query parameters properly parsed
3. Test: Invalid parameters don't break endpoint

### Frontend Tests (TDD - Write First!)

**Filter Controls**
1. Test: Status filter updates query and fetches results
2. Test: Date range filter updates results
3. Test: Budget range filter updates results
4. Test: Search input debounces API calls
5. Test: Clear filters resets all filters

**Sort Controls**
1. Test: Selecting sort option updates results
2. Test: Toggle sort order updates results
3. Test: Current sort visually indicated

**Plans List with Filters**
1. Test: Applies filters from URL params on mount
2. Test: Updates URL when filters change
3. Test: Shows active filters summary
4. Test: Displays results count
5. Test: Shows empty state when no results

**Search Bar**
1. Test: Search input calls API with debounce
2. Test: Clear button resets search
3. Test: Search term persists in URL

**Filter Pills**
1. Test: Active filters displayed as pills
2. Test: Clicking pill removes that filter
3. Test: "Clear All" removes all filters
4. Test: Pills update when filters change

**URL State**
1. Test: Filters encoded in URL query params
2. Test: URL params restored to filters on load
3. Test: Browser back/forward navigation works
4. Test: Invalid URL params handled gracefully

### UI Tests (Playwright - Max 5 tests)
1. Test: Filter plans by status and see results update
2. Test: Search for plan by destination
3. Test: Sort plans by budget
4. Test: Apply multiple filters together
5. Test: Clear all filters returns to full list

## Success Criteria

- [ ] Backend supports query parameters for filtering
  - Status filter
  - Date range filter
  - Budget range filter
  - Multiple filters work together
- [ ] Backend supports sorting
  - Sort by multiple fields
  - Ascending/descending order
  - Default sort applied
- [ ] Backend supports search
  - Searches name, destination, description
  - Case-insensitive
  - Partial matches
- [ ] Filter controls component implemented
  - All filter types available
  - Clear filters button
  - Real-time updates
- [ ] Sort controls component implemented
  - Multiple sort options
  - Order toggle
  - Visual indication of active sort
- [ ] Search bar component functional
  - Debounced input
  - Clear button
  - Results update
- [ ] Filter pills display active filters
  - Individual removal
  - Clear all option
- [ ] URL state management working
  - Filters in URL params
  - Restore from URL
  - Shareable URLs
- [ ] Empty results state handled
  - Clear messaging
  - Helpful suggestions
- [ ] All backend tests pass: `npm test --workspace=backend`
- [ ] All frontend tests pass: `npm test --workspace=frontend`
- [ ] All UI tests pass: `npm run test:ui --workspace=frontend`
- [ ] No linting errors in both packages

## Notes

- Debounce search input to reduce API calls
- Consider adding saved filter presets
- Make filters responsive for mobile
- Use URL params for shareable links
- Consider pagination if many plans
- Test with large datasets
- Provide clear feedback when filtering
- Keep filter UI simple and intuitive

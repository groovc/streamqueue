# Issue #3: Feature — Content availability by region

## Description

StreamQueue licenses content for specific regions with defined availability windows. We need API endpoints that let clients query what content is available in a given region at the current time.

## Data Model

The `content_availability` table stores licensing windows:

```sql
content_availability (
  id, content_id, region, available_from, available_until, created_at
)
```

- `region`: short code like `US`, `UK`, `EU`, `JP`
- `available_from`: when the license starts
- `available_until`: when it expires (`NULL` means no expiry)

## Requirements

Implement three functions in `src/services/availabilityService.ts`:

### `getAvailableContent(region, filters?)`
- Return all content available in the given region **right now**
- Available means:
  - Has a row in `content_availability` for this region
  - `available_from <= NOW()`
  - `available_until IS NULL` OR `available_until > NOW()`
- Join with the `content` table to include metadata (title, genre, type, etc.)
- Support optional filtering by `genre` and `type`
- Order results by `title`

### `checkAvailability(contentId, region)`
- Return whether a specific content item is available in a given region
- Include the availability window (`from` and `until`) in the response
- Return `{ available: false }` if no matching row exists or window is outside current time

### `getRegionsForContent(contentId)`
- Return an array of region codes where this content is **currently** available
- Only include regions where the availability window is currently active

## Tests

```bash
npm test -- --testPathPattern=availability
```

All tests in `src/tests/availability.test.ts` should pass.

## Acceptance Criteria

- [ ] All availability tests pass
- [ ] Time-based filtering works correctly (expired content excluded)
- [ ] Genre and type filters work
- [ ] Empty results handled gracefully
- [ ] SQL queries are parameterized (no injection risk)

## Bonus Considerations

- Episodes inherit availability from their parent series. If "Quantum Loop" (series, id=10) is available in the US, its episodes should also appear in US queries. This is **not required** but earns bonus points.
- Think about how you'd add caching here if the `content_availability` table had millions of rows.

## Files to Modify

- `src/services/availabilityService.ts` — implement all three functions

## Notes

- The route handlers in `src/routes/availability.ts` are already wired up.
- Check `src/seed.ts` for the test data to understand expected results.

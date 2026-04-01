# Issue #1: Bug — Watch history creates duplicate entries under concurrent requests

## Description

When multiple requests to record watch progress arrive simultaneously for the same user + content combination, duplicate rows are created in the `watch_history` table. This causes incorrect data in the "Continue Watching" feed and inflated watch counts.

## How to Reproduce

Run the test suite:

```bash
npm test -- --testPathPattern=watchHistory
```

The test `"should NOT create duplicate entries under concurrent requests"` will **fail**. It fires 10 concurrent `recordWatch()` calls for the same user + content and asserts there should be exactly 1 row.

## Root Cause

The `recordWatch` function in `src/services/watchHistoryService.ts` uses a check-then-insert pattern:

1. SELECT to see if a row exists
2. If not, INSERT a new row

Under concurrency, multiple requests pass the SELECT check before any INSERT completes, resulting in duplicate rows.

## Acceptance Criteria

- [ ] The failing test passes
- [ ] All other existing tests continue to pass
- [ ] The fix handles concurrency at the **database level** (not application-level locks)
- [ ] No data loss — concurrent updates to progress should not be silently dropped

## Hints

- Look at PostgreSQL's `INSERT ... ON CONFLICT` (UPSERT) capabilities
- You'll likely need to add a database constraint
- Consider what happens to the `updated_at` timestamp during concurrent updates

## Files to Modify

- `src/services/watchHistoryService.ts` — fix the race condition
- `src/migrate.ts` — add a unique constraint (if needed)

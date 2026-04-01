# Stretch Goal S2: Refactor — Normalize the content metadata schema

## Description

The `content` table is a denormalized mess. Movies, series, and episodes all live in the same table with nullable columns that only apply to certain content types:

- `duration_minutes` — only meaningful for movies and episodes (NULL for series)
- `series_id`, `season_number`, `episode_number` — only meaningful for episodes (NULL for movies and series)

This design makes queries awkward, allows invalid data (e.g., a movie with a `series_id`), and will get worse as we add more content types.

## Requirements

1. Design a normalized schema that separates movies, series, and episodes into distinct tables (or uses a cleaner inheritance pattern)
2. Write a migration that transforms the existing data
3. Update the `contentService` and any other services that query the `content` table
4. All existing tests must continue to pass

## Considerations

- The API response format should remain the same (don't break clients)
- Think about how this affects the availability queries — episodes reference series via `series_id`
- Consider PostgreSQL table inheritance or a shared `content` table with type-specific detail tables

## Files to Modify

- `src/migrate.ts` — add new schema
- `src/services/contentService.ts` — update queries
- Potentially other services that join on `content`

# Stretch Goal S1: Frontend — "Continue Watching" Row

## Description

Build out the `ContinueWatching` component in `frontend/src/components/ContinueWatching.tsx`. It's currently a stub that shows placeholder text.

## Requirements

1. Fetch data from `GET /api/watch-history/continue` with an auth header
2. Render a horizontally scrollable row of cards
3. Each card shows:
   - Title
   - Thumbnail placeholder (or image if URL exists)
   - A progress bar showing `progress_seconds / duration_seconds` as a percentage
4. Handle loading and error states

## Bonus

- Polling or WebSocket for real-time updates
- Click-to-resume that calls `POST /api/sessions` to start a streaming session
- Responsive design

## Setup

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api/*` requests to `http://localhost:3000`.

## Files to Modify

- `frontend/src/components/ContinueWatching.tsx`
- Add any additional components you need

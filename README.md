# StreamQueue — Coding Exercise

A partially-built REST API for a video streaming platform. Your job is to fix bugs, implement features, and demonstrate your problem-solving approach.

## Time Limit

**1 hour.** We don't expect you to finish everything. Focus on the 3 main issues first, then tackle stretch goals if time allows. Quality over quantity.

## What We're Evaluating

- **Problem-solving**: Do you understand the existing code before changing it?
- **Code quality**: Are your solutions production-grade or just happy-path?
- **AI fluency**: We encourage you to use AI tools (Copilot, Claude, ChatGPT, etc.). We're evaluating how effectively you use them — not whether you use them.
- **Communication**: Clear commit messages and PR descriptions matter.

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Git

### Setup

```bash
# Clone and enter the repo
git clone <repo-url>
cd streamqueue

# Copy env file
cp .env.example .env

# Start Postgres and Redis
docker compose up db redis -d

# Install dependencies
npm install

# Run migrations and seed data
npm run seed

# Start the dev server
npm run dev
```

The API will be running at `http://localhost:3000`.

### Verify it works

```bash
# Health check
curl http://localhost:3000/health

# List all content
curl http://localhost:3000/content

# Get watch history (requires auth)
curl -H "Authorization: Bearer tok_alice_premium" \
  http://localhost:3000/watch-history
```

### Running Tests

```bash
npm test
```

Some tests are **expected to fail** — that's intentional. Your job is to make them pass.

## Test Users

| User  | Email              | Tier     | Token                | Max Streams |
|-------|--------------------|----------|----------------------|-------------|
| Alice | alice@example.com  | premium  | `tok_alice_premium`  | 4           |
| Bob   | bob@example.com    | standard | `tok_bob_standard`   | 2           |
| Carol | carol@example.com  | basic    | `tok_carol_basic`    | 1           |
| Dave  | dave@example.com   | premium  | `tok_dave_premium`   | 4           |

## API Endpoints

### Working

| Method | Path                        | Auth | Description                  |
|--------|-----------------------------|------|------------------------------|
| GET    | `/health`                   | No   | Health check                 |
| GET    | `/content`                  | No   | List all content             |
| GET    | `/content/:id`              | No   | Get content by ID            |
| POST   | `/watch-history`            | Yes  | Record watch progress        |
| GET    | `/watch-history`            | Yes  | Get user's watch history     |
| GET    | `/watch-history/continue`   | Yes  | Get "continue watching" list |

### To Implement (Issues #2 and #3)

| Method | Path                                    | Auth | Description                          |
|--------|-----------------------------------------|------|--------------------------------------|
| POST   | `/sessions`                             | Yes  | Start a streaming session            |
| POST   | `/sessions/:id/heartbeat`               | Yes  | Keep session alive                   |
| DELETE | `/sessions/:id`                         | Yes  | End a streaming session              |
| GET    | `/availability/:region`                 | No   | Content available in a region        |
| GET    | `/availability/:region/content/:id`     | No   | Check specific content availability  |
| GET    | `/availability/content/:id/regions`     | No   | Get regions for a content item       |

## Issues

Work through the issues in order. Each issue has tests that define the expected behavior.

### Main Issues (do these first)

1. **Bug: Watch history creates duplicate entries under concurrent requests** — `src/tests/watchHistory.test.ts`
2. **Feature: Streaming session management with tier-based limits** — `src/tests/sessions.test.ts`
3. **Feature: Content availability by region** — `src/tests/availability.test.ts`

### Stretch Goals (if time allows)

- **S1**: Build the "Continue Watching" frontend component — `frontend/src/components/ContinueWatching.tsx`
- **S2**: Normalize the content metadata schema — the `content` table is a flat denormalized mess (movies, series, and episodes all in one table with nullable columns). Design and implement a cleaner schema with proper migrations.

## How to Submit

1. Create a branch from `main`
2. Make your changes with clear, descriptive commits
3. Open a PR for each issue (or one combined PR — your call)
4. Include a brief summary of your approach and any trade-offs you considered

Good luck!

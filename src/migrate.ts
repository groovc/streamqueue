import { pool } from "./db";

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(20) NOT NULL DEFAULT 'basic',
    api_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Intentionally denormalized: movies, series, and episodes all in one table
  -- with nullable columns. This is the target of the stretch refactor goal.
  CREATE TABLE IF NOT EXISTS content (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('movie', 'series', 'episode')),
    genre VARCHAR(100),
    release_year INT,
    rating VARCHAR(10),
    duration_minutes INT,
    series_id INT REFERENCES content(id),
    season_number INT,
    episode_number INT,
    description TEXT,
    thumbnail_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- NOTE: No unique constraint on (user_id, content_id).
  -- This is intentional — it is the root cause of Issue #1.
  CREATE TABLE IF NOT EXISTS watch_history (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    content_id INT NOT NULL REFERENCES content(id),
    progress_seconds INT NOT NULL DEFAULT 0,
    duration_seconds INT NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS streaming_sessions (
    id UUID PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    content_id INT NOT NULL REFERENCES content(id),
    device_id VARCHAR(255) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN NOT NULL DEFAULT TRUE
  );

  CREATE TABLE IF NOT EXISTS content_availability (
    id SERIAL PRIMARY KEY,
    content_id INT NOT NULL REFERENCES content(id),
    region VARCHAR(10) NOT NULL,
    available_from TIMESTAMP WITH TIME ZONE NOT NULL,
    available_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_watch_history_user ON watch_history(user_id);
  CREATE INDEX IF NOT EXISTS idx_watch_history_content ON watch_history(content_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_user_active ON streaming_sessions(user_id, active);
  CREATE INDEX IF NOT EXISTS idx_availability_region ON content_availability(region, available_from, available_until);
`;

export async function migrate() {
  console.log("Running migrations...");
  await pool.query(SCHEMA);
  console.log("Migrations complete.");
}

if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}

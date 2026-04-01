import { pool } from "./db";
import { migrate } from "./migrate";

const SEED = `
  -- Clear existing data
  TRUNCATE users, content, watch_history, streaming_sessions, content_availability RESTART IDENTITY CASCADE;

  -- Users with different subscription tiers
  INSERT INTO users (email, name, subscription_tier, api_token) VALUES
    ('alice@example.com', 'Alice Chen', 'premium', 'tok_alice_premium'),
    ('bob@example.com', 'Bob Martinez', 'standard', 'tok_bob_standard'),
    ('carol@example.com', 'Carol Johnson', 'basic', 'tok_carol_basic'),
    ('dave@example.com', 'Dave Kim', 'premium', 'tok_dave_premium');

  -- Movies
  INSERT INTO content (id, title, type, genre, release_year, rating, duration_minutes, description, thumbnail_url) VALUES
    (1, 'The Last Algorithm', 'movie', 'Sci-Fi', 2024, 'PG-13', 142, 'A programmer discovers an AI that can predict the future.', '/thumbnails/last-algorithm.jpg'),
    (2, 'Midnight in Tokyo', 'movie', 'Drama', 2023, 'R', 118, 'Two strangers meet in a Tokyo jazz bar and change each others lives.', '/thumbnails/midnight-tokyo.jpg'),
    (3, 'Speed Demons', 'movie', 'Action', 2024, 'PG-13', 130, 'Underground street racers take on a corrupt corporation.', '/thumbnails/speed-demons.jpg'),
    (4, 'The Garden Wall', 'movie', 'Animation', 2023, 'PG', 95, 'A young girl discovers a magical world behind her garden wall.', '/thumbnails/garden-wall.jpg'),
    (5, 'Code Red', 'movie', 'Thriller', 2024, 'R', 108, 'A cybersecurity analyst uncovers a conspiracy inside her own company.', '/thumbnails/code-red.jpg');

  -- Series
  INSERT INTO content (id, title, type, genre, release_year, rating, description, thumbnail_url) VALUES
    (10, 'Quantum Loop', 'series', 'Sci-Fi', 2023, 'TV-14', 'Scientists trapped in a time loop must solve increasingly complex puzzles to escape.', '/thumbnails/quantum-loop.jpg'),
    (20, 'The Kitchen', 'series', 'Comedy', 2024, 'TV-MA', 'A struggling chef inherits a chaotic restaurant in Brooklyn.', '/thumbnails/the-kitchen.jpg');

  -- Episodes for Quantum Loop (series_id = 10)
  INSERT INTO content (title, type, genre, release_year, rating, duration_minutes, series_id, season_number, episode_number, description) VALUES
    ('Pilot', 'episode', 'Sci-Fi', 2023, 'TV-14', 52, 10, 1, 1, 'Dr. Maya Lin activates the quantum device for the first time.'),
    ('Echoes', 'episode', 'Sci-Fi', 2023, 'TV-14', 48, 10, 1, 2, 'The team realizes they are reliving the same day.'),
    ('Fracture', 'episode', 'Sci-Fi', 2023, 'TV-14', 55, 10, 1, 3, 'A crack in the loop reveals an alternate timeline.'),
    ('Convergence', 'episode', 'Sci-Fi', 2023, 'TV-14', 50, 10, 1, 4, 'Two versions of Maya must work together.'),
    ('The Exit', 'episode', 'Sci-Fi', 2023, 'TV-14', 60, 10, 1, 5, 'Season finale. The team makes a desperate attempt to break free.');

  -- Episodes for The Kitchen (series_id = 20)
  INSERT INTO content (title, type, genre, release_year, rating, duration_minutes, series_id, season_number, episode_number, description) VALUES
    ('Opening Night', 'episode', 'Comedy', 2024, 'TV-MA', 30, 20, 1, 1, 'Marco arrives in Brooklyn to claim his inheritance.'),
    ('Health Inspector', 'episode', 'Comedy', 2024, 'TV-MA', 28, 20, 1, 2, 'A surprise inspection threatens to shut everything down.'),
    ('The Critic', 'episode', 'Comedy', 2024, 'TV-MA', 31, 20, 1, 3, 'A famous food critic is coming — but nobody can agree on the menu.'),
    ('Family Recipe', 'episode', 'Comedy', 2024, 'TV-MA', 29, 20, 1, 4, 'Marcos grandmother visits with strong opinions.');

  -- Watch history (some existing records for Alice and Bob)
  INSERT INTO watch_history (user_id, content_id, progress_seconds, duration_seconds, completed) VALUES
    (1, 1, 8520, 8520, TRUE),
    (1, 2, 3200, 7080, FALSE),
    (1, 10, 3120, 3120, TRUE),
    (2, 3, 7800, 7800, TRUE),
    (2, 1, 4200, 8520, FALSE);

  -- Content availability (regional licensing)
  INSERT INTO content_availability (content_id, region, available_from, available_until) VALUES
    -- The Last Algorithm: available everywhere
    (1, 'US', '2024-01-01', '2026-12-31'),
    (1, 'UK', '2024-03-01', '2026-12-31'),
    (1, 'EU', '2024-03-01', '2026-12-31'),
    (1, 'JP', '2024-06-01', '2026-12-31'),
    -- Midnight in Tokyo: US and JP only
    (2, 'US', '2024-01-01', '2025-12-31'),
    (2, 'JP', '2023-06-01', NULL),
    -- Speed Demons: US only, expiring soon
    (3, 'US', '2024-06-01', '2025-06-01'),
    -- The Garden Wall: everywhere, no expiry
    (4, 'US', '2023-01-01', NULL),
    (4, 'UK', '2023-01-01', NULL),
    (4, 'EU', '2023-01-01', NULL),
    (4, 'JP', '2023-06-01', NULL),
    -- Code Red: UK/EU only
    (5, 'UK', '2024-01-01', '2026-06-30'),
    (5, 'EU', '2024-01-01', '2026-06-30'),
    -- Quantum Loop (series): US and UK
    (10, 'US', '2023-09-01', NULL),
    (10, 'UK', '2024-01-01', NULL),
    -- The Kitchen: US only
    (20, 'US', '2024-03-01', NULL);
`;

async function seed() {
  await migrate();
  console.log("Seeding database...");
  await pool.query(SEED);
  console.log("Seeding complete.");
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}

export { seed };

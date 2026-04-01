import { pool } from "../db";
import { WatchHistoryEntry } from "../models/types";

/**
 * Record or update a user's watch progress for a piece of content.
 *
 * BUG: This function has a race condition. When two requests arrive
 * simultaneously for the same user + content, both can pass the
 * SELECT check and insert duplicate rows.
 *
 * The candidate should fix this. Possible approaches:
 * - INSERT ... ON CONFLICT (requires adding a unique constraint)
 * - SELECT ... FOR UPDATE within a transaction
 * - Application-level deduplication (less ideal)
 */
export async function recordWatch(
  userId: number,
  contentId: number,
  progressSeconds: number,
  durationSeconds: number
): Promise<WatchHistoryEntry> {
  // Check if a record already exists for this user + content
  const existing = await pool.query(
    "SELECT * FROM watch_history WHERE user_id = $1 AND content_id = $2",
    [userId, contentId]
  );

  if (existing.rows.length > 0) {
    // Update existing record
    const completed = progressSeconds >= durationSeconds;
    const result = await pool.query(
      `UPDATE watch_history
       SET progress_seconds = $1, duration_seconds = $2, completed = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [progressSeconds, durationSeconds, completed, existing.rows[0].id]
    );
    return result.rows[0];
  }

  // No existing record — insert a new one
  // BUG: Another request may have inserted between the SELECT above and this INSERT
  const completed = progressSeconds >= durationSeconds;
  const result = await pool.query(
    `INSERT INTO watch_history (user_id, content_id, progress_seconds, duration_seconds, completed)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, contentId, progressSeconds, durationSeconds, completed]
  );
  return result.rows[0];
}

/**
 * Get a user's full watch history, ordered by most recently watched.
 */
export async function getWatchHistory(
  userId: number
): Promise<WatchHistoryEntry[]> {
  const result = await pool.query(
    `SELECT wh.*, c.title, c.type, c.thumbnail_url, c.duration_minutes
     FROM watch_history wh
     JOIN content c ON c.id = wh.content_id
     WHERE wh.user_id = $1
     ORDER BY wh.updated_at DESC`,
    [userId]
  );
  return result.rows;
}

/**
 * Get items the user has started but not finished ("Continue Watching").
 */
export async function getContinueWatching(
  userId: number
): Promise<WatchHistoryEntry[]> {
  const result = await pool.query(
    `SELECT wh.*, c.title, c.type, c.thumbnail_url, c.duration_minutes
     FROM watch_history wh
     JOIN content c ON c.id = wh.content_id
     WHERE wh.user_id = $1
       AND wh.completed = FALSE
       AND wh.progress_seconds > 0
     ORDER BY wh.updated_at DESC`,
    [userId]
  );
  return result.rows;
}

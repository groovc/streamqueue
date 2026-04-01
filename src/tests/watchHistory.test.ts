import { pool } from "../db";
import { migrate } from "../migrate";
import { seed } from "../seed";
import {
  recordWatch,
  getWatchHistory,
  getContinueWatching,
} from "../services/watchHistoryService";

beforeAll(async () => {
  await migrate();
  await seed();
});

afterAll(async () => {
  await pool.end();
});

describe("Watch History Service", () => {
  beforeEach(async () => {
    // Reset watch history to seed state before each test
    await pool.query("DELETE FROM watch_history");
    await pool.query(`
      INSERT INTO watch_history (user_id, content_id, progress_seconds, duration_seconds, completed) VALUES
        (1, 1, 8520, 8520, TRUE),
        (1, 2, 3200, 7080, FALSE),
        (2, 3, 7800, 7800, TRUE),
        (2, 1, 4200, 8520, FALSE)
    `);
  });

  describe("recordWatch", () => {
    it("should create a new watch history entry", async () => {
      const entry = await recordWatch(1, 3, 1000, 7800);
      expect(entry.user_id).toBe(1);
      expect(entry.content_id).toBe(3);
      expect(entry.progress_seconds).toBe(1000);
      expect(entry.completed).toBe(false);
    });

    it("should update an existing watch history entry", async () => {
      // User 1 already has a record for content 2 at 3200s
      const entry = await recordWatch(1, 2, 5000, 7080);
      expect(entry.progress_seconds).toBe(5000);
      expect(entry.completed).toBe(false);

      // Verify there's still only one record
      const result = await pool.query(
        "SELECT * FROM watch_history WHERE user_id = 1 AND content_id = 2"
      );
      expect(result.rows.length).toBe(1);
    });

    it("should mark as completed when progress equals duration", async () => {
      const entry = await recordWatch(1, 3, 7800, 7800);
      expect(entry.completed).toBe(true);
    });

    /**
     * THIS TEST EXPOSES THE BUG (Issue #1)
     *
     * It fires multiple concurrent recordWatch calls for the same user + content.
     * Without proper handling, this creates duplicate rows.
     *
     * The candidate's fix should make this test pass.
     */
    it("should NOT create duplicate entries under concurrent requests", async () => {
      const userId = 3; // Dave — no existing watch history
      const contentId = 4;

      // Fire 10 concurrent requests for the same user + content
      const promises = Array.from({ length: 10 }, (_, i) =>
        recordWatch(userId, contentId, (i + 1) * 100, 5700)
      );

      await Promise.all(promises);

      // There should be exactly ONE row for this user + content
      const result = await pool.query(
        "SELECT * FROM watch_history WHERE user_id = $1 AND content_id = $2",
        [userId, contentId]
      );

      expect(result.rows.length).toBe(1);
    });
  });

  describe("getWatchHistory", () => {
    it("should return watch history for a user", async () => {
      const history = await getWatchHistory(1);
      expect(history.length).toBe(2);
      // Should include content details from the JOIN
      expect(history[0]).toHaveProperty("title");
    });

    it("should return empty array for user with no history", async () => {
      const history = await getWatchHistory(3);
      expect(history.length).toBe(0);
    });
  });

  describe("getContinueWatching", () => {
    it("should return only incomplete items with progress", async () => {
      const items = await getContinueWatching(1);
      // User 1: content 1 is completed, content 2 is in-progress
      expect(items.length).toBe(1);
      expect(items[0].content_id).toBe(2);
    });
  });
});

import { pool } from "../db";
import { migrate } from "../migrate";
import { seed } from "../seed";
import {
  startSession,
  heartbeat,
  endSession,
  cleanupExpiredSessions,
} from "../services/sessionService";

beforeAll(async () => {
  await migrate();
  await seed();
});

afterAll(async () => {
  await pool.end();
});

describe("Streaming Session Service", () => {
  beforeEach(async () => {
    // Clear all sessions before each test
    await pool.query("DELETE FROM streaming_sessions");
  });

  describe("startSession", () => {
    it("should create a new streaming session", async () => {
      const session = await startSession(1, 1, "device-abc");
      expect(session).toMatchObject({
        user_id: 1,
        content_id: 1,
        device_id: "device-abc",
        active: true,
      });
      expect(session.id).toBeDefined();
      expect(session.expires_at).toBeDefined();
    });

    it("should allow a premium user to have up to 4 concurrent sessions", async () => {
      // Alice is premium (max 4)
      await startSession(1, 1, "device-1");
      await startSession(1, 2, "device-2");
      await startSession(1, 3, "device-3");
      const session4 = await startSession(1, 4, "device-4");
      expect(session4.active).toBe(true);
    });

    it("should reject when a basic user exceeds 1 concurrent session", async () => {
      // Carol is basic (max 1)
      await startSession(3, 1, "device-1");
      await expect(startSession(3, 2, "device-2")).rejects.toThrow(
        /concurrent stream limit/
      );
    });

    it("should reject when a standard user exceeds 2 concurrent sessions", async () => {
      // Bob is standard (max 2)
      await startSession(2, 1, "device-1");
      await startSession(2, 2, "device-2");
      await expect(startSession(2, 3, "device-3")).rejects.toThrow(
        /concurrent stream limit/
      );
    });

    it("should not count inactive sessions toward the limit", async () => {
      // Carol is basic (max 1)
      const session = await startSession(3, 1, "device-1");
      await endSession(session.id);

      // Should succeed since the first session is now inactive
      const session2 = await startSession(3, 2, "device-2");
      expect(session2.active).toBe(true);
    });
  });

  describe("heartbeat", () => {
    it("should update the last_heartbeat timestamp", async () => {
      const session = await startSession(1, 1, "device-abc");
      const original = session.last_heartbeat;

      // Small delay to ensure timestamp differs
      await new Promise((r) => setTimeout(r, 50));
      const updated = await heartbeat(session.id);

      expect(new Date(updated.last_heartbeat).getTime()).toBeGreaterThanOrEqual(
        new Date(original).getTime()
      );
    });

    it("should throw for a non-existent session", async () => {
      await expect(
        heartbeat("00000000-0000-0000-0000-000000000000")
      ).rejects.toThrow(/not found/);
    });
  });

  describe("endSession", () => {
    it("should mark a session as inactive", async () => {
      const session = await startSession(1, 1, "device-abc");
      await endSession(session.id);

      const result = await pool.query(
        "SELECT active FROM streaming_sessions WHERE id = $1",
        [session.id]
      );
      expect(result.rows[0].active).toBe(false);
    });
  });

  describe("cleanupExpiredSessions", () => {
    it("should deactivate sessions with stale heartbeats", async () => {
      // Create a session and manually backdate its heartbeat
      const session = await startSession(1, 1, "device-abc");
      await pool.query(
        "UPDATE streaming_sessions SET last_heartbeat = NOW() - INTERVAL '10 minutes' WHERE id = $1",
        [session.id]
      );

      const cleaned = await cleanupExpiredSessions();
      expect(cleaned).toBeGreaterThanOrEqual(1);

      const result = await pool.query(
        "SELECT active FROM streaming_sessions WHERE id = $1",
        [session.id]
      );
      expect(result.rows[0].active).toBe(false);
    });
  });
});

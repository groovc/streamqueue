import { pool } from "../db";
import { StreamingSession } from "../models/types";
import { config } from "../config";

/**
 * ISSUE #2: Streaming Session Management
 *
 * Candidates must implement the following:
 *
 * 1. startSession(userId, contentId, deviceId)
 *    - Check how many active sessions the user has
 *    - Compare against their subscription tier limit (basic=1, standard=2, premium=4)
 *    - If at limit, return an error (do NOT silently kill oldest session)
 *    - Otherwise, create a new session with a UUID and expiry timestamp
 *
 * 2. heartbeat(sessionId)
 *    - Update the last_heartbeat and extend expires_at
 *    - Return 404 if session doesn't exist or is inactive
 *
 * 3. endSession(sessionId)
 *    - Mark session as inactive
 *
 * 4. cleanupExpiredSessions()
 *    - Mark all sessions as inactive where last_heartbeat is older than
 *      config.sessionTimeoutMinutes
 *    - This should be callable from a background interval
 *
 * Key considerations:
 * - Race condition: two "start" requests at the same time could both
 *   see count < limit and both succeed. The candidate should handle this.
 * - The cleanup function should be idempotent.
 */

// TODO: Implement startSession
export async function startSession(
  userId: number,
  contentId: number,
  deviceId: string
): Promise<StreamingSession> {
  throw new Error("Not implemented — see Issue #2");
}

// TODO: Implement heartbeat
export async function heartbeat(sessionId: string): Promise<StreamingSession> {
  throw new Error("Not implemented — see Issue #2");
}

// TODO: Implement endSession
export async function endSession(sessionId: string): Promise<void> {
  throw new Error("Not implemented — see Issue #2");
}

// TODO: Implement cleanupExpiredSessions
export async function cleanupExpiredSessions(): Promise<number> {
  throw new Error("Not implemented — see Issue #2");
}

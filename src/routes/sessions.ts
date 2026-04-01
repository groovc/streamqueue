import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import {
  startSession,
  heartbeat,
  endSession,
} from "../services/sessionService";

const router = Router();

// All session routes require authentication
router.use(authenticate);

/**
 * ISSUE #2: Candidates must implement the session service functions.
 * The routes below are wired up and ready — the service layer throws
 * "Not implemented" errors until the candidate fills them in.
 */

// POST /sessions — start a new streaming session
router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { content_id, device_id } = req.body;

    if (!content_id || !device_id) {
      res
        .status(400)
        .json({ error: "content_id and device_id are required" });
      return;
    }

    const session = await startSession(userId, content_id, device_id);
    res.status(201).json({ data: session });
  } catch (err: any) {
    if (err.message === "Not implemented — see Issue #2") {
      res.status(501).json({ error: err.message });
      return;
    }
    if (err.message?.includes("concurrent stream limit")) {
      res.status(409).json({ error: err.message });
      return;
    }
    console.error("Error starting session:", err);
    res.status(500).json({ error: "Failed to start session" });
  }
});

// POST /sessions/:id/heartbeat — keep session alive
router.post("/:id/heartbeat", async (req: Request, res: Response) => {
  try {
    const session = await heartbeat(req.params.id);
    res.json({ data: session });
  } catch (err: any) {
    if (err.message === "Not implemented — see Issue #2") {
      res.status(501).json({ error: err.message });
      return;
    }
    if (err.message?.includes("not found")) {
      res.status(404).json({ error: err.message });
      return;
    }
    console.error("Error sending heartbeat:", err);
    res.status(500).json({ error: "Failed to send heartbeat" });
  }
});

// DELETE /sessions/:id — end a streaming session
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await endSession(req.params.id);
    res.status(204).send();
  } catch (err: any) {
    if (err.message === "Not implemented — see Issue #2") {
      res.status(501).json({ error: err.message });
      return;
    }
    console.error("Error ending session:", err);
    res.status(500).json({ error: "Failed to end session" });
  }
});

export default router;

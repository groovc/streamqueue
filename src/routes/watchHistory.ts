import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import {
  recordWatch,
  getWatchHistory,
  getContinueWatching,
} from "../services/watchHistoryService";

const router = Router();

// All watch history routes require authentication
router.use(authenticate);

// POST /watch-history — record or update watch progress
router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { content_id, progress_seconds, duration_seconds } = req.body;

    if (!content_id || progress_seconds === undefined || !duration_seconds) {
      res.status(400).json({
        error: "content_id, progress_seconds, and duration_seconds are required",
      });
      return;
    }

    const entry = await recordWatch(
      userId,
      content_id,
      progress_seconds,
      duration_seconds
    );
    res.json({ data: entry });
  } catch (err) {
    console.error("Error recording watch:", err);
    res.status(500).json({ error: "Failed to record watch progress" });
  }
});

// GET /watch-history — get full watch history for authenticated user
router.get("/", async (req: Request, res: Response) => {
  try {
    const history = await getWatchHistory(req.user!.id);
    res.json({ data: history });
  } catch (err) {
    console.error("Error fetching watch history:", err);
    res.status(500).json({ error: "Failed to fetch watch history" });
  }
});

// GET /watch-history/continue — get "continue watching" items
router.get("/continue", async (req: Request, res: Response) => {
  try {
    const items = await getContinueWatching(req.user!.id);
    res.json({ data: items });
  } catch (err) {
    console.error("Error fetching continue watching:", err);
    res.status(500).json({ error: "Failed to fetch continue watching" });
  }
});

export default router;

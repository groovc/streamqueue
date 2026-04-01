import { Router, Request, Response } from "express";
import {
  getAvailableContent,
  checkAvailability,
  getRegionsForContent,
} from "../services/availabilityService";

const router = Router();

/**
 * ISSUE #3: Candidates must implement the availability service functions.
 * The routes below are wired up and ready — the service layer throws
 * "Not implemented" errors until the candidate fills them in.
 */

// GET /availability/:region — get all content available in a region
router.get("/:region", async (req: Request, res: Response) => {
  try {
    const { region } = req.params;
    const { genre, type } = req.query;

    const filters: any = {};
    if (genre) filters.genre = genre as string;
    if (type) filters.type = type as string;

    const content = await getAvailableContent(region, filters);
    res.json({ data: content, region });
  } catch (err: any) {
    if (err.message === "Not implemented — see Issue #3") {
      res.status(501).json({ error: err.message });
      return;
    }
    console.error("Error fetching availability:", err);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

// GET /availability/:region/content/:contentId — check if specific content is available
router.get(
  "/:region/content/:contentId",
  async (req: Request, res: Response) => {
    try {
      const { region, contentId } = req.params;
      const id = parseInt(contentId, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid content ID" });
        return;
      }

      const result = await checkAvailability(id, region);
      res.json({ data: result, region, content_id: id });
    } catch (err: any) {
      if (err.message === "Not implemented — see Issue #3") {
        res.status(501).json({ error: err.message });
        return;
      }
      console.error("Error checking availability:", err);
      res.status(500).json({ error: "Failed to check availability" });
    }
  }
);

// GET /availability/content/:contentId/regions — get all regions for a content item
router.get(
  "/content/:contentId/regions",
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.contentId, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid content ID" });
        return;
      }

      const regions = await getRegionsForContent(id);
      res.json({ data: regions, content_id: id });
    } catch (err: any) {
      if (err.message === "Not implemented — see Issue #3") {
        res.status(501).json({ error: err.message });
        return;
      }
      console.error("Error fetching regions:", err);
      res.status(500).json({ error: "Failed to fetch regions" });
    }
  }
);

export default router;

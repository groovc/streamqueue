import { Router, Request, Response } from "express";
import {
  getAllContent,
  getContentById,
  getEpisodesBySeries,
} from "../services/contentService";

const router = Router();

// GET /content — list all content
router.get("/", async (_req: Request, res: Response) => {
  try {
    const content = await getAllContent();
    res.json({ data: content });
  } catch (err) {
    console.error("Error fetching content:", err);
    res.status(500).json({ error: "Failed to fetch content" });
  }
});

// GET /content/:id — get a single content item
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid content ID" });
      return;
    }

    const content = await getContentById(id);
    if (!content) {
      res.status(404).json({ error: "Content not found" });
      return;
    }

    // If it's a series, also fetch episodes
    if (content.type === "series") {
      const episodes = await getEpisodesBySeries(id);
      res.json({ data: { ...content, episodes } });
      return;
    }

    res.json({ data: content });
  } catch (err) {
    console.error("Error fetching content:", err);
    res.status(500).json({ error: "Failed to fetch content" });
  }
});

export default router;

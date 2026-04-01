import express from "express";
import cors from "cors";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import contentRoutes from "./routes/content";
import watchHistoryRoutes from "./routes/watchHistory";
import sessionRoutes from "./routes/sessions";
import availabilityRoutes from "./routes/availability";

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/content", contentRoutes);
app.use("/watch-history", watchHistoryRoutes);
app.use("/sessions", sessionRoutes);
app.use("/availability", availabilityRoutes);

// Error handler
app.use(errorHandler);

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`StreamQueue API running on port ${config.port}`);
  });
}

export { app };

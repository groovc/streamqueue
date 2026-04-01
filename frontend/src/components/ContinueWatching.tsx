import { useEffect, useState } from "react";

/**
 * STRETCH GOAL S1: "Continue Watching" Row
 *
 * This component is a stub. The candidate should:
 * 1. Fetch from GET /api/watch-history/continue
 * 2. Render a horizontally scrollable row of cards
 * 3. Each card shows: title, thumbnail, and a progress bar
 * 4. Progress bar shows (progress_seconds / duration_seconds) as a percentage
 *
 * Bonus points for:
 * - Polling or WebSocket for real-time updates
 * - Click-to-resume that starts a streaming session
 * - Loading and error states
 */

interface WatchItem {
  id: number;
  content_id: number;
  title: string;
  thumbnail_url: string;
  progress_seconds: number;
  duration_seconds: number;
}

export function ContinueWatching() {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from /api/watch-history/continue with auth header
    // For now, show placeholder
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (items.length === 0) {
    return (
      <section>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
          Continue Watching
        </h2>
        <p style={{ color: "#888" }}>
          Nothing to continue. This component is a stub — see Stretch Goal S1.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
        Continue Watching
      </h2>
      <div style={{ display: "flex", gap: "1rem", overflowX: "auto" }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              minWidth: 200,
              background: "#222",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{ height: 120, background: "#333", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {item.thumbnail_url ? (
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ color: "#666" }}>No thumbnail</span>
              )}
            </div>
            <div style={{ padding: "0.75rem" }}>
              <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                {item.title}
              </div>
              <div
                style={{ height: 4, background: "#444", borderRadius: 2 }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(item.progress_seconds / item.duration_seconds) * 100}%`,
                    background: "#e50914",
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

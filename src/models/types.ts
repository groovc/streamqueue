export interface User {
  id: number;
  email: string;
  name: string;
  subscription_tier: "basic" | "standard" | "premium";
  api_token: string;
  created_at: Date;
}

export interface Content {
  id: number;
  title: string;
  type: "movie" | "series" | "episode";
  genre: string | null;
  release_year: number | null;
  rating: string | null;
  duration_minutes: number | null;
  series_id: number | null;
  season_number: number | null;
  episode_number: number | null;
  description: string | null;
  thumbnail_url: string | null;
  created_at: Date;
}

export interface WatchHistoryEntry {
  id: number;
  user_id: number;
  content_id: number;
  progress_seconds: number;
  duration_seconds: number;
  completed: boolean;
  watched_at: Date;
  updated_at: Date;
}

export interface StreamingSession {
  id: string;
  user_id: number;
  content_id: number;
  device_id: string;
  started_at: Date;
  last_heartbeat: Date;
  expires_at: Date | null;
  active: boolean;
}

export interface ContentAvailability {
  id: number;
  content_id: number;
  region: string;
  available_from: Date;
  available_until: Date | null;
  created_at: Date;
}

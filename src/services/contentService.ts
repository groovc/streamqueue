import { pool } from "../db";
import { Content } from "../models/types";

export async function getAllContent(): Promise<Content[]> {
  const result = await pool.query(
    "SELECT * FROM content ORDER BY created_at DESC"
  );
  return result.rows;
}

export async function getContentById(id: number): Promise<Content | null> {
  const result = await pool.query("SELECT * FROM content WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function getEpisodesBySeries(
  seriesId: number
): Promise<Content[]> {
  const result = await pool.query(
    `SELECT * FROM content
     WHERE series_id = $1 AND type = 'episode'
     ORDER BY season_number, episode_number`,
    [seriesId]
  );
  return result.rows;
}

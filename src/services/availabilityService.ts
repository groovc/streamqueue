import { pool } from "../db";
import { Content } from "../models/types";

/**
 * ISSUE #3: Content Availability by Region
 *
 * Candidates must implement the following:
 *
 * 1. getAvailableContent(region, options?)
 *    - Return all content available in the given region RIGHT NOW
 *    - A content item is available if:
 *      a) It has a row in content_availability for this region
 *      b) available_from <= NOW
 *      c) available_until IS NULL (no expiry) OR available_until > NOW
 *    - Support optional filtering by genre and content type
 *    - Include content metadata in the response (join with content table)
 *    - Order by title
 *
 * 2. checkAvailability(contentId, region)
 *    - Return whether a specific piece of content is available in a region
 *    - Include the availability window (from/until) in the response
 *
 * 3. getRegionsForContent(contentId)
 *    - Return all regions where this content is currently available
 *    - Useful for the frontend to show "Available in: US, UK, ..."
 *
 * Key considerations:
 * - Timezone handling: all timestamps are stored as TIMESTAMP WITH TIME ZONE.
 *   Make sure comparisons use NOW() consistently.
 * - Episodes inherit availability from their parent series.
 *   If "Quantum Loop" (series, id=10) is available in US, then all its episodes
 *   should appear in US availability queries too.
 * - Content with no availability rows should NOT appear in any region.
 */

export interface AvailabilityFilter {
  genre?: string;
  type?: "movie" | "series" | "episode";
}

// TODO: Implement getAvailableContent
export async function getAvailableContent(
  region: string,
  filters?: AvailabilityFilter
): Promise<Content[]> {
  throw new Error("Not implemented — see Issue #3");
}

// TODO: Implement checkAvailability
export async function checkAvailability(
  contentId: number,
  region: string
): Promise<{ available: boolean; from?: Date; until?: Date | null }> {
  throw new Error("Not implemented — see Issue #3");
}

// TODO: Implement getRegionsForContent
export async function getRegionsForContent(
  contentId: number
): Promise<string[]> {
  throw new Error("Not implemented — see Issue #3");
}

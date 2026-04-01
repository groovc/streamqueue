import { pool } from "../db";
import { migrate } from "../migrate";
import { seed } from "../seed";
import {
  getAvailableContent,
  checkAvailability,
  getRegionsForContent,
} from "../services/availabilityService";

beforeAll(async () => {
  await migrate();
  await seed();
});

afterAll(async () => {
  await pool.end();
});

describe("Content Availability Service", () => {
  describe("getAvailableContent", () => {
    it("should return content available in the US", async () => {
      const content = await getAvailableContent("US");
      const titles = content.map((c) => c.title);

      // Based on seed data, US should have:
      // The Last Algorithm, Midnight in Tokyo, The Garden Wall, Quantum Loop, The Kitchen
      // Speed Demons availability ends 2025-06-01 — may or may not be current
      expect(titles).toContain("The Last Algorithm");
      expect(titles).toContain("The Garden Wall");
      expect(titles).toContain("Quantum Loop");

      // Code Red is only in UK/EU
      expect(titles).not.toContain("Code Red");
    });

    it("should return content available in the UK", async () => {
      const content = await getAvailableContent("UK");
      const titles = content.map((c) => c.title);

      expect(titles).toContain("Code Red");
      expect(titles).toContain("The Garden Wall");
      expect(titles).toContain("Quantum Loop");

      // The Kitchen is US only
      expect(titles).not.toContain("The Kitchen");
    });

    it("should filter by genre", async () => {
      const content = await getAvailableContent("US", { genre: "Sci-Fi" });
      const titles = content.map((c) => c.title);

      expect(titles).toContain("The Last Algorithm");
      expect(titles).toContain("Quantum Loop");
      expect(titles).not.toContain("The Garden Wall");
    });

    it("should filter by content type", async () => {
      const content = await getAvailableContent("US", { type: "movie" });
      content.forEach((c) => {
        expect(c.type).toBe("movie");
      });
    });

    it("should return empty array for a region with no content", async () => {
      const content = await getAvailableContent("BR");
      expect(content).toEqual([]);
    });
  });

  describe("checkAvailability", () => {
    it("should confirm available content", async () => {
      const result = await checkAvailability(1, "US");
      expect(result.available).toBe(true);
      expect(result.from).toBeDefined();
    });

    it("should deny unavailable content", async () => {
      // Code Red (id=5) is not available in US
      const result = await checkAvailability(5, "US");
      expect(result.available).toBe(false);
    });

    it("should include availability window", async () => {
      const result = await checkAvailability(1, "US");
      expect(result.available).toBe(true);
      expect(result.from).toBeDefined();
      expect(result.until).toBeDefined();
    });
  });

  describe("getRegionsForContent", () => {
    it("should return all regions for widely available content", async () => {
      // The Garden Wall (id=4) is available in US, UK, EU, JP
      const regions = await getRegionsForContent(4);
      expect(regions).toContain("US");
      expect(regions).toContain("UK");
      expect(regions).toContain("EU");
      expect(regions).toContain("JP");
    });

    it("should return limited regions for restricted content", async () => {
      // Code Red (id=5) is only UK and EU
      const regions = await getRegionsForContent(5);
      expect(regions).toContain("UK");
      expect(regions).toContain("EU");
      expect(regions).not.toContain("US");
    });

    it("should return empty array for content with no availability", async () => {
      // Content with no availability rows (e.g., an episode not directly listed)
      const regions = await getRegionsForContent(9999);
      expect(regions).toEqual([]);
    });
  });
});

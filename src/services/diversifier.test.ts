import { describe, it, expect } from "vitest";
import { diversifyResults } from "./diversifier";
import { makeMovie } from "../test/fixtures";
import type { ScoredMovie } from "./matchingEngine";

function scored(id: string, score: number, overrides: Parameters<typeof makeMovie>[0] = {}): ScoredMovie {
  return {
    movie: makeMovie({ id, ...overrides }),
    score,
    breakdown: { mood: 0.8, concentration: 0.7, social: 0.6, rating: 0.75 },
  };
}

describe("diversifyResults", () => {
  it("returns all items when fewer than topCount", () => {
    const items = [scored("1", 90), scored("2", 80)];
    const result = diversifyResults(items, 4);
    expect(result).toHaveLength(2);
  });

  it("always keeps the highest-scored item first", () => {
    const items = [
      scored("1", 95, { genre: ["Action"] }),
      scored("2", 90, { genre: ["Drama"] }),
      scored("3", 85, { genre: ["Comedy"] }),
      scored("4", 80, { genre: ["Horror"] }),
      scored("5", 75, { genre: ["Romance"] }),
    ];
    const result = diversifyResults(items, 4);
    expect(result[0].movie.id).toBe("1");
  });

  it("returns all items (top + remaining)", () => {
    const items = Array.from({ length: 8 }, (_, i) =>
      scored(`m${i}`, 90 - i * 5, { genre: [["Action", "Drama", "Comedy", "Horror"][i % 4]] }),
    );
    const result = diversifyResults(items, 4);
    expect(result).toHaveLength(8);
  });

  it("favors genre diversity in top picks", () => {
    const items = [
      scored("1", 95, { genre: ["Action"], year: 2020, country: "US", director: "A" }),
      scored("2", 93, { genre: ["Action"], year: 2020, country: "US", director: "A" }),
      scored("3", 91, { genre: ["Drama"], year: 1995, country: "France", director: "B" }),
      scored("4", 89, { genre: ["Comedy"], year: 2010, country: "UK", director: "C" }),
      scored("5", 87, { genre: ["Horror"], year: 2000, country: "Japan", director: "D" }),
    ];
    const result = diversifyResults(items, 4);
    const topGenres = result.slice(0, 4).map((r) => r.movie.genre[0]);
    const uniqueGenres = new Set(topGenres);
    expect(uniqueGenres.size).toBeGreaterThanOrEqual(3);
  });
});

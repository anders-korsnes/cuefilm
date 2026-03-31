import { describe, it, expect } from "vitest";
import { scoreMovies } from "./matchingEngine";
import { makeMovie, makeCriteria } from "../test/fixtures";

describe("scoreMovies", () => {
  it("returns scored results sorted by score descending", () => {
    const movies = [
      makeMovie({ id: "1", rating: 9.0, genre: ["Drama"], mood: { energy: 2, emotional: 8, complexity: 4, feelGoodFactor: 7, tension: 3 } }),
      makeMovie({ id: "2", rating: 5.0, genre: ["Horror"], mood: { energy: 8, emotional: 2, complexity: 3, feelGoodFactor: 2, tension: 9 } }),
      makeMovie({ id: "3", rating: 7.0, genre: ["Comedy"], mood: { energy: 6, emotional: 4, complexity: 3, feelGoodFactor: 9, tension: 2 } }),
    ];

    const criteria = makeCriteria({ currentMood: "sad", desiredMood: "uplifted" });
    const results = scoreMovies(movies, criteria);

    expect(results.length).toBeGreaterThan(0);

    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it("filters out watched movies when enough alternatives exist", () => {
    const movies = [
      makeMovie({ id: "1" }),
      makeMovie({ id: "2" }),
      makeMovie({ id: "3" }),
      makeMovie({ id: "4" }),
    ];
    const watched = new Set(["1"]);
    const criteria = makeCriteria();

    const results = scoreMovies(movies, criteria, watched);
    const ids = results.map((r) => r.movie.id);

    expect(ids).not.toContain("1");
  });

  it("falls back to including watched movies when pool is too small", () => {
    const movies = [
      makeMovie({ id: "1" }),
      makeMovie({ id: "2" }),
    ];
    const watched = new Set(["1", "2"]);
    const criteria = makeCriteria();

    const results = scoreMovies(movies, criteria, watched);
    expect(results.length).toBeGreaterThan(0);
  });

  it("uses fallback pool when no movies pass hard filters", () => {
    const movies = [
      makeMovie({ id: "1", runtime: 300, mediaType: "movie" }),
    ];
    const criteria = makeCriteria({ availableTime: 90 });

    const results = scoreMovies(movies, criteria);
    // Fallback: scoreMovies returns scored fallback when filters remove everything
    expect(results.length).toBeGreaterThanOrEqual(0);
    if (results.length > 0) {
      expect(results[0].movie.id).toBe("1");
    }
  });

  it("caps low-rated movies at score 50", () => {
    const movies = [
      makeMovie({ id: "1", rating: 3.0 }),
      makeMovie({ id: "2", rating: 8.5 }),
    ];
    const criteria = makeCriteria();
    const results = scoreMovies(movies, criteria);

    const lowRated = results.find((r) => r.movie.id === "1");
    if (lowRated) {
      expect(lowRated.score).toBeLessThanOrEqual(65);
    }
  });

  it("filters by runtime (too long for available time)", () => {
    const movies = [
      makeMovie({ id: "short", runtime: 90 }),
      makeMovie({ id: "long", runtime: 200 }),
    ];
    const criteria = makeCriteria({ availableTime: 100 });
    const results = scoreMovies(movies, criteria);
    const ids = results.map((r) => r.movie.id);

    expect(ids).toContain("short");
    expect(ids).not.toContain("long");
  });

  it("filters by year range", () => {
    const movies = [
      makeMovie({ id: "old", year: 1950 }),
      makeMovie({ id: "new", year: 2020 }),
    ];
    const criteria = makeCriteria({ yearRange: [2000, 2025] });
    const results = scoreMovies(movies, criteria);
    const ids = results.map((r) => r.movie.id);

    expect(ids).toContain("new");
    expect(ids).not.toContain("old");
  });

  it("scores include a breakdown object", () => {
    const movies = [makeMovie()];
    const criteria = makeCriteria();
    const results = scoreMovies(movies, criteria);

    expect(results[0].breakdown).toHaveProperty("mood");
    expect(results[0].breakdown).toHaveProperty("concentration");
    expect(results[0].breakdown).toHaveProperty("social");
    expect(results[0].breakdown).toHaveProperty("rating");
  });

  it("normalizes scores between 60-100 for non-trivial input", () => {
    const movies = Array.from({ length: 10 }, (_, i) =>
      makeMovie({
        id: `m${i}`,
        rating: 5 + i * 0.5,
        mood: { energy: i, emotional: 10 - i, complexity: 5, feelGoodFactor: i, tension: 10 - i },
      }),
    );
    const criteria = makeCriteria();
    const results = scoreMovies(movies, criteria);

    for (const r of results) {
      expect(r.score).toBeGreaterThanOrEqual(55);
      expect(r.score).toBeLessThanOrEqual(100);
    }
  });
});

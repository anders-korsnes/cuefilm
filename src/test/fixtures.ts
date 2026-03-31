import type { Movie } from "../types/movie";
import type { UserCriteria } from "../types/criteria";

export function makeMovie(overrides: Partial<Movie> = {}): Movie {
  return {
    id: "tt-test-1",
    title: "Test Movie",
    year: 2024,
    genre: ["Drama"],
    runtime: 120,
    rating: 7.5,
    voteCount: 5000,
    plot: "A test movie plot.",
    poster: "https://example.com/poster.jpg",
    director: "Test Director",
    actors: ["Actor One", "Actor Two"],
    language: "english",
    country: "United States",
    mood: { energy: 5, emotional: 5, complexity: 5, feelGoodFactor: 5, tension: 5 },
    mediaType: "movie",
    ...overrides,
  };
}

export function makeCriteria(overrides: Partial<UserCriteria> = {}): UserCriteria {
  return {
    currentMood: "sad",
    desiredMood: "uplifted",
    availableTime: 150,
    concentration: "medium",
    socialContext: "alone",
    mediaType: "movie",
    yearRange: [1970, new Date().getFullYear()],
    language: "any",
    country: "any",
    ...overrides,
  };
}

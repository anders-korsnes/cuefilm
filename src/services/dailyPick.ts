import type { Movie } from "../types/movie";
import type { UserCriteria } from "../types/criteria";
import { scoreMovies } from "./matchingEngine";

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getDailyPick(
  movies: Movie[],
  criteria: UserCriteria | null,
): { movie: Movie; score: number } | null {
  if (movies.length === 0) return null;

  if (!criteria) {
    const today = new Date().toDateString();
    const index = hashString(today) % movies.length;
    return { movie: movies[index], score: -1 };
  }

  const scored = scoreMovies(movies, criteria);
  const topMovies = scored.slice(0, Math.min(3, scored.length));

  const today = new Date().toDateString();
  const index = hashString(today) % topMovies.length;

  return {
    movie: topMovies[index].movie,
    score: topMovies[index].score,
  };
}

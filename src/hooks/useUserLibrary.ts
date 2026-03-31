import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/react";
import { apiUrl } from "../services/apiConfig";
import type { UserMovie } from "../types/userMovie";
import type { Movie } from "../types/movie";

function useUserLibrary() {
  const { isSignedIn, getToken } = useAuth();
  const [library, setLibrary] = useState<UserMovie[]>([]);

  const authFetch = useCallback(
    async (path: string, options?: RequestInit) => {
      const token = await getToken();
      return fetch(apiUrl(path), {
        ...options,
        headers: {
          ...options?.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    },
    [getToken],
  );

  useEffect(() => {
    if (!isSignedIn) {
      setLibrary([]);
      return;
    }
    authFetch("/api/library")
      .then((r) => {
        if (!r.ok) throw new Error(`Library fetch failed: ${r.status}`);
        return r.json();
      })
      .then((data: UserMovie[]) => setLibrary(data))
      .catch((err) => console.error("Failed to load library:", err));
  }, [isSignedIn, authFetch]);

  const findEntry = (movieId: string): UserMovie | undefined =>
    library.find((e) => e.movieId === movieId);

  const buildSnapshot = (movie: Movie) => ({
    id: movie.id,
    title: movie.title,
    year: movie.year,
    genre: movie.genre,
    runtime: movie.runtime,
    rating: movie.rating,
    voteCount: movie.voteCount,
    poster: movie.poster,
    language: movie.language,
    country: movie.country,
    mediaType: movie.mediaType,
    numberOfSeasons: movie.numberOfSeasons,
  });

  const toggle = useCallback(async (
    endpoint: string,
    movieId: string,
    movie?: Movie,
  ) => {
    if (!isSignedIn) return;
    try {
      const res = await authFetch(`/api/library/${endpoint}/${movieId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(movie ? { movieSnapshot: buildSnapshot(movie) } : {}),
      });
      if (!res.ok) throw new Error(`Toggle failed: ${res.status}`);
      const updated: UserMovie = await res.json();
      setLibrary((prev) => {
        const exists = prev.find((e) => e.movieId === movieId);
        return exists
          ? prev.map((e) => (e.movieId === movieId ? updated : e))
          : [...prev, updated];
      });
    } catch (err) {
      console.error(`Failed to ${endpoint}:`, err);
    }
  }, [isSignedIn, authFetch]);

  const toggleSave = useCallback(
    (movieId: string, movie?: Movie) => toggle("toggle-save", movieId, movie),
    [toggle],
  );

  const toggleWatched = useCallback(
    (movieId: string, movie?: Movie) => toggle("toggle-watched", movieId, movie),
    [toggle],
  );

  return { library, findEntry, toggleSave, toggleWatched };
}

export default useUserLibrary;

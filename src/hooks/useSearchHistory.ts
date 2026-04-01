import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/react";
import { apiUrl } from "../services/apiConfig";
import type { UserCriteria } from "../types/criteria";

export type SearchHistoryEntry = {
  _id: string;
  criteria: {
    currentMood: string | null;
    desiredMood: string | null;
    concentration: string | null;
    socialContext: string | null;
    mediaType: string;
    availableTime?: number;
    yearFrom?: number;
    yearTo?: number;
    language?: string;
    country?: string;
  };
  topRecommendations: {
    movieId: string;
    title: string;
    year: number;
    poster: string;
    score: number;
  }[];
  isRandom: boolean;
  isHiddenGem: boolean;
  createdAt: string;
};

export default function useSearchHistory() {
  const { getToken, isSignedIn } = useAuth();
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const authFetch = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const token = await getToken();
      return fetch(apiUrl(path), {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    },
    [getToken],
  );

  const fetchHistory = useCallback(async () => {
    if (!isSignedIn) return;
    setLoading(true);
    try {
      const res = await authFetch("/api/history?limit=20");
      if (res.ok) {
        setHistory(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [authFetch, isSignedIn]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const saveSearch = useCallback(
    async (
      criteria: UserCriteria,
      topMovies: { movieId: string; title: string; year: number; poster: string; score: number }[],
      isRandom = false,
      isHiddenGem = false,
    ) => {
      if (!isSignedIn) return;
      try {
        await authFetch("/api/history", {
          method: "POST",
          body: JSON.stringify({
            criteria: {
              currentMood: criteria.currentMood,
              desiredMood: criteria.desiredMood,
              concentration: criteria.concentration,
              socialContext: criteria.socialContext,
              mediaType: criteria.mediaType,
              availableTime: criteria.availableTime,
              yearFrom: criteria.yearRange[0],
              yearTo: criteria.yearRange[1],
              language: criteria.language,
              country: criteria.country,
            },
            topRecommendations: topMovies.slice(0, 5),
            isRandom,
            isHiddenGem,
          }),
        });
        fetchHistory();
      } catch {
        // silently fail
      }
    },
    [authFetch, isSignedIn, fetchHistory],
  );

  return { history, loading, saveSearch, fetchHistory };
}

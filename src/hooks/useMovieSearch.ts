import { useState, useRef, useCallback } from "react";
import { useTranslation } from "./useTranslation";
import type { UserCriteria } from "../types/criteria";
import type { ScoredMovie } from "../services/matchingEngine";
import { searchByMood } from "../services/movieApi";
import { scoreMovies } from "../services/matchingEngine";

function useMovieSearch() {
  const { t, language } = useTranslation();
  const [results, setResults] = useState<ScoredMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHiddenGem, setIsHiddenGem] = useState(false);
  const searchIdRef = useRef(0);

  const search = useCallback(async (criteria: UserCriteria, hiddenGem: boolean = false, watchedIds: Set<string> = new Set()): Promise<ScoredMovie[]> => {
    const currentSearchId = ++searchIdRef.current;

    setLoading(true);
    setError(null);
    setIsHiddenGem(hiddenGem);

    try {
      const movies = await searchByMood(
        criteria.desiredMood || "amused",
        criteria.language,
        criteria.country,
        criteria.yearRange[0],
        criteria.yearRange[1],
        criteria.currentMood || undefined,
        hiddenGem,
        language,
        criteria.mediaType,
      );

      if (currentSearchId !== searchIdRef.current) return [];

      if (movies.length === 0) {
        setError(hiddenGem ? t("error.noHiddenGems") : t("error.noResults"));
        setResults([]);
        return [];
      }

      const scored = scoreMovies(movies, criteria, watchedIds);
      setResults(scored);
      return scored;
    } catch {
      if (currentSearchId !== searchIdRef.current) return [];
      setError(t("error.fetchFailed"));
      setResults([]);
      return [];
    } finally {
      if (currentSearchId === searchIdRef.current) {
        setLoading(false);
      }
    }
  }, [language, t]);

  return { results, loading, error, isHiddenGem, search };
}

export default useMovieSearch;

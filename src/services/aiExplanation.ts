import type { Movie } from "../types/movie";
import type { UserCriteria } from "../types/criteria";
import { apiUrl } from "./apiConfig";

type TranslateFunc = (
  key: string,
  params?: Record<string, string | number>,
) => string;

export type AIExplanationResult = {
  explanation: string;
  error?: string;
};

export type LikedMovie = { title: string; year: number };

export async function generateAIExplanation(
  movie: Movie,
  criteria: UserCriteria,
  t: TranslateFunc,
  language: string,
  likedMovies: LikedMovie[] = [],
): Promise<AIExplanationResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const hasCriteria = !!(criteria.currentMood || criteria.desiredMood);

    const currentMoodLabel = criteria.currentMood
      ? t(`mood.${criteria.currentMood}`)
      : "";
    const desiredMoodLabel = criteria.desiredMood
      ? t(
          `mood.${criteria.desiredMood === "scared" ? "desiredScared" : criteria.desiredMood}`,
        )
      : "";
    const socialLabel = criteria.socialContext
      ? t(`settings.${criteria.socialContext}`)
      : "";
    const concLabel = criteria.concentration
      ? t(`settings.${criteria.concentration}`)
      : "";

    const res = await fetch(apiUrl("/api/ai/explain"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        movie: {
          title: movie.title,
          year: movie.year,
          genre: movie.genre,
          rating: movie.rating,
          plot: movie.plot,
        },
        criteria: hasCriteria ? {
          currentMood: currentMoodLabel,
          desiredMood: desiredMoodLabel,
          concentration: concLabel,
          socialContext: socialLabel,
        } : null,
        language,
        likedMovies: likedMovies.slice(0, 5),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { explanation: "", error: errorData.error || `HTTP ${res.status}` };
    }

    const data = await res.json();
    return { explanation: data.explanation || "" };
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === "AbortError") {
      return { explanation: "", error: "timeout" };
    }
    console.error("AI explanation error:", err);
    return { explanation: "", error: "network" };
  }
}

export async function sendAIFeedback(
  movieId: string,
  movieTitle: string,
  feedback: "up" | "down",
  getToken: () => Promise<string | null>,
): Promise<void> {
  try {
    const token = await getToken();
    await fetch(apiUrl("/api/ai/feedback"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ movieId, movieTitle, feedback }),
    });
  } catch {
    // silently fail
  }
}

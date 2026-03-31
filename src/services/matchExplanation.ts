import type { Movie } from "../types/movie";
import type { UserCriteria } from "../types/criteria";

type TranslateFunc = (
  key: string,
  params?: Record<string, string | number>,
) => string;

export function generateExplanation(
  movie: Movie,
  criteria: UserCriteria,
  t: TranslateFunc,
): string {
  const parts: string[] = [];

  if (criteria.currentMood && criteria.desiredMood) {
    parts.push(getJourneyIntro(criteria.currentMood, criteria.desiredMood, t));
  }

  parts.push(getGenreReason(movie, criteria, t));
  parts.push(getEnergyReason(movie, t));

  if (criteria.socialContext) {
    parts.push(getSocialReason(movie, criteria.socialContext, t));
  }

  if (movie.runtime <= criteria.availableTime) {
    parts.push(t("explanation.timeFit", { runtime: movie.runtime }));
  }

  return parts.filter(Boolean).join(" ");
}

function getJourneyIntro(
  currentMood: string,
  desiredMood: string,
  t: TranslateFunc,
): string {
  const key = `explanation.journey.${currentMood}_${desiredMood}`;
  const specific = t(key);

  if (specific !== key) return specific;

  return t("explanation.journey.generic", {
    from: t(`mood.${currentMood}`),
    to: t(`mood.${desiredMood === "scared" ? "desiredScared" : desiredMood}`),
  });
}

function getGenreReason(
  movie: Movie,
  criteria: UserCriteria,
  t: TranslateFunc,
): string {
  const genre = movie.genre.map((g) => g.toLowerCase());
  const genreText = movie.genre.join("/");
  const desired = criteria.desiredMood;

  if (
    genre.includes("comedy") &&
    ["amused", "uplifted", "relaxed"].includes(desired || "")
  ) {
    return t("explanation.genre.comedy", { genre: genreText });
  }
  if (
    genre.includes("thriller") &&
    ["thrilled", "tense"].includes(desired || "")
  ) {
    return t("explanation.genre.thriller", { genre: genreText });
  }
  if (genre.includes("horror") && desired === "scared") {
    return t("explanation.genre.horror", { genre: genreText });
  }
  if (
    genre.includes("drama") &&
    ["moved", "thoughtful"].includes(desired || "")
  ) {
    return t("explanation.genre.drama", { genre: genreText });
  }
  if (
    genre.includes("romance") &&
    ["relaxed", "moved", "uplifted"].includes(desired || "")
  ) {
    return t("explanation.genre.romance", { genre: genreText });
  }
  if (
    genre.includes("animation") &&
    ["amused", "uplifted", "relaxed"].includes(desired || "")
  ) {
    return t("explanation.genre.animation", { genre: genreText });
  }
  if (
    genre.includes("action") &&
    ["thrilled", "energetic"].includes(desired || "")
  ) {
    return t("explanation.genre.action", { genre: genreText });
  }

  return t("explanation.genre.generic", { genre: genreText });
}

function getEnergyReason(movie: Movie, t: TranslateFunc): string {
  const mood = movie.mood;

  if (mood.energy <= 3 && mood.tension <= 3)
    return t("explanation.energy.calm");
  if (mood.energy >= 7 && mood.tension >= 7)
    return t("explanation.energy.intense");
  if (mood.feelGoodFactor >= 8) return t("explanation.energy.feelgood");
  if (mood.emotional >= 8) return t("explanation.energy.emotional");
  if (mood.tension >= 7 && mood.energy <= 5)
    return t("explanation.energy.slowBurn");

  return "";
}

function getSocialReason(
  movie: Movie,
  context: string,
  t: TranslateFunc,
): string {
  const genre = movie.genre.map((g) => g.toLowerCase());

  if (context === "alone" && genre.includes("thriller"))
    return t("explanation.social.aloneThriller");
  if (context === "partner" && genre.includes("romance"))
    return t("explanation.social.partnerRomance");
  if (context === "friends" && genre.includes("comedy"))
    return t("explanation.social.friendsComedy");
  if (context === "friends" && genre.includes("horror"))
    return t("explanation.social.friendsHorror");
  if (
    context === "family" &&
    (genre.includes("animation") || genre.includes("family"))
  )
    return t("explanation.social.familySafe");

  return t(`explanation.social.${context}`);
}

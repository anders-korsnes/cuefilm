import type { Movie } from "../types/movie";
import type { UserCriteria } from "../types/criteria";
import { currentMoodProfiles, desiredMoodProfiles } from "../data/moodMappings";
import { countryMapping } from "../data/countryMappings";
import { diversifyResults } from "./diversifier";

export type ScoredMovie = {
  movie: Movie;
  score: number;
  breakdown: ScoreBreakdown;
};

export type ScoreBreakdown = {
  mood: number;
  concentration: number;
  social: number;
  rating: number;
};

export function scoreMovies(
  movies: Movie[],
  criteria: UserCriteria,
  watchedIds: Set<string> = new Set(),
): ScoredMovie[] {
  const unwatched = movies.filter((m) => !watchedIds.has(m.id));
  const pool = unwatched.length >= 3 ? unwatched : movies;
  const filtered = pool.filter((movie) => passesHardFilters(movie, criteria));

  const scored = filtered.map((movie) => calculateSoftScore(movie, criteria));
  const adjusted = scored.map((result) => applyDealBreakers(result, criteria));

  // Normaliser — beste film = 95-100, resten relativt
  const normalized = normalizeScores(adjusted);

  normalized.sort((a, b) => b.score - a.score);

  const diversified = diversifyResults(normalized, 4);

  if (diversified.length === 0) {
    const fallback = movies
      .map((movie) => calculateSoftScore(movie, criteria))
      .sort((a, b) => b.score - a.score);
    return normalizeScores(diversifyResults(fallback, 4));
  }

  return diversified;
}

function normalizeScores(scored: ScoredMovie[]): ScoredMovie[] {
  if (scored.length === 0) return scored;

  const rawScores = scored.map((s) => s.score);
  const maxScore = Math.max(...rawScores);
  const minScore = Math.min(...rawScores);
  const range = maxScore - minScore;

  // Hvis alle har samme score, gi alle 95
  if (range === 0) {
    return scored.map((s) => ({ ...s, score: 95 }));
  }

  // Tilfeldig daglig variasjon (0-5 poeng)
  const now = new Date();
  const daySeed =
    now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

  return scored.map((s) => {
    // Normaliser til 60-95 range
    const normalized = ((s.score - minScore) / range) * 35 + 60;

    // Legg til liten daglig variasjon per film
    const filmSeed = hashString(s.movie.id + daySeed);
    const dailyBonus = filmSeed % 6;

    // Beste film får alltid 95-100
    const isTop = s.score === maxScore;
    const finalScore = isTop
      ? Math.min(100, Math.round(normalized + dailyBonus + 3))
      : Math.min(97, Math.round(normalized + dailyBonus));

    return { ...s, score: finalScore };
  });
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}
function applyDealBreakers(
  result: ScoredMovie,
  criteria: UserCriteria,
): ScoredMovie {
  let { score } = result;
  const { breakdown, movie } = result;

  // Mood-match under 0.3 = cap på 45
  if (breakdown.mood < 0.3 && criteria.currentMood && criteria.desiredMood) {
    score = Math.min(score, 45);
  }

  // Boost: god mood-match + høy rating
  if (breakdown.mood > 0.8 && movie.rating >= 7.5) {
    score = Math.min(100, score + 5);
  }

  // Boost: perfekt mood-match + perfekt tid
  if (breakdown.mood > 0.9 && movie.runtime <= criteria.availableTime) {
    score = Math.min(100, score + 3);
  }

  // Straff: veldig lav rating uansett mood-match
  if (movie.rating < 5.0) {
    score = Math.min(score, 50);
  }

  return { movie, score, breakdown };
}
// ============================
// HARD FILTERS
// ============================

function passesHardFilters(movie: Movie, criteria: UserCriteria): boolean {
  const timeNotRelevant = criteria.availableTime <= 30;
  const runtimeUnknown = movie.runtime === 0;

  if (!timeNotRelevant && !runtimeUnknown) {
    if (movie.mediaType === "series") {
      // For series, only filter if episode runtime is clearly too long (e.g. 3h+ episodes)
      if (movie.runtime > 180) return false;
    } else {
      if (movie.runtime < 60) return false;
      if (movie.runtime > criteria.availableTime + 30) return false;
    }
  }

  if (criteria.yearRange) {
    const [fromYear, toYear] = criteria.yearRange;
    const currentYear = new Date().getFullYear();
    if (fromYear === toYear && toYear === currentYear) {
      if (movie.year < fromYear) return false;
    } else {
      if (movie.year < fromYear - 5 || movie.year > toYear + 5) return false;
    }
  }

  if (criteria.language && criteria.language !== "any") {
    const movieLanguages = movie.language.toLowerCase();
    if (!movieLanguages.includes(criteria.language)) return false;
  }

  if (criteria.country && criteria.country !== "any") {
    const movieCountry = movie.country.toLowerCase();
    const countryTerms = countryMapping[criteria.country];
    const countryMatch = countryTerms.some((term) =>
      movieCountry.includes(term),
    );
    if (!countryMatch) return false;
  }

  return true;
}

// ============================
// SOFT SCORING
// ============================

function calculateSoftScore(movie: Movie, criteria: UserCriteria): ScoredMovie {
  const breakdown: ScoreBreakdown = {
    mood: 0,
    concentration: 0,
    social: 0,
    rating: 0,
  };

  let score = 0;
  let maxScore = 0;

  // Emosjonell reise — 45%
  if (criteria.currentMood && criteria.desiredMood) {
    breakdown.mood = scoreEmotionalJourney(
      movie,
      criteria.currentMood,
      criteria.desiredMood,
    );
    score += breakdown.mood * 45;
    maxScore += 45;
  }

  // Konsentrasjon i kontekst — 15%
  if (criteria.concentration) {
    breakdown.concentration = scoreConcentrationInContext(
      movie,
      criteria.concentration,
      criteria.currentMood,
    );
    score += breakdown.concentration * 15;
    maxScore += 15;
  }

  // Sosial kontekst i kontekst — 15%
  if (criteria.socialContext) {
    breakdown.social = scoreSocialInContext(
      movie,
      criteria.socialContext,
      criteria.currentMood,
      criteria.desiredMood,
    );
    score += breakdown.social * 15;
    maxScore += 15;
  }

  // IMDB-rating — 15%
  breakdown.rating = Math.min(1, movie.rating / 10);
  score += breakdown.rating * 15;
  maxScore += 15;

  // Tid-bonus — 10%
  const timeNotRelevant = criteria.availableTime <= 30 || movie.runtime === 0;
  const timeBonus = timeNotRelevant
    ? 0.8
    : movie.runtime <= criteria.availableTime
      ? 1
      : Math.max(0, 1 - (movie.runtime - criteria.availableTime) / 30);
  score += timeBonus * 10;
  maxScore += 10;

  const finalScore = maxScore === 0 ? 50 : Math.round((score / maxScore) * 100);
  return { movie, score: finalScore, breakdown };
}

// ============================
// EMOSJONELL REISE
// Scorer filmen basert på reisen fra currentMood til desiredMood
// ============================

function scoreEmotionalJourney(
  movie: Movie,
  currentMood: string,
  desiredMood: string,
): number {
  const start =
    currentMoodProfiles[currentMood as keyof typeof currentMoodProfiles];
  const end =
    desiredMoodProfiles[desiredMood as keyof typeof desiredMoodProfiles];
  if (!start || !end) return 0.5;

  const m = movie.mood;

  // Beregn "reisen" — hvor mye endring trenger brukeren?
  const energyShift = end.energy - start.energy;
  const emotionalShift = end.emotional - start.emotional;
  const tensionShift = end.tension - start.tension;
  const feelgoodShift = end.feelGoodFactor - start.feelGoodFactor;
  const complexityShift = end.complexity - start.complexity;

  let totalScore = 0;
  let totalWeight = 0;

  // ENERGI-REISE
  // Stor økning: filmen må starte rolig og bygge opp (mid-high energy)
  // Liten økning: filmen kan matche desired direkte
  // Nedgang: filmen bør ha lav, jevn energi
  const energyScore = scoreShift(
    m.energy,
    start.energy,
    end.energy,
    energyShift,
  );
  totalScore += energyScore * 1.2;
  totalWeight += 1.2;

  // EMOSJONELL REISE
  // Stor økning (vil bli mer emosjonell): filmen må bygge emosjonelt
  // Nedgang (vil bli mindre emosjonell): filmen bør være lett
  const emotionalScore = scoreShift(
    m.emotional,
    start.emotional,
    end.emotional,
    emotionalShift,
  );
  totalScore += emotionalScore * 1.5;
  totalWeight += 1.5;

  // TENSION-REISE
  // Økning: filmen bør ha tension som matcher eller overgår desired
  // Nedgang: filmen bør ha minimal tension
  const tensionScore = scoreShift(
    m.tension,
    start.tension,
    end.tension,
    tensionShift,
  );
  totalScore += tensionScore * 1.3;
  totalWeight += 1.3;

  // FEELGOOD-REISE
  // Økning: filmen bør være varmere enn der brukeren er nå
  // Nedgang (vil ha mørkere): filmen bør ha lav feelgood
  const feelgoodScore = scoreShift(
    m.feelGoodFactor,
    start.feelGoodFactor,
    end.feelGoodFactor,
    feelgoodShift,
  );
  totalScore += feelgoodScore * 1.4;
  totalWeight += 1.4;

  // KOMPLEKSITET
  const complexityScore = scoreShift(
    m.complexity,
    start.complexity,
    end.complexity,
    complexityShift,
  );
  totalScore += complexityScore * 0.8;
  totalWeight += 0.8;

  return totalScore / totalWeight;
}

function scoreShift(
  movieValue: number,
  startValue: number,
  endValue: number,
  shift: number,
): number {
  const absShift = Math.abs(shift);

  if (absShift <= 2) {
    // Liten endring: filmen bør matche desired direkte
    const diff = Math.abs(movieValue - endValue);
    return Math.max(0, 1 - diff / 7);
  }

  if (shift > 0) {
    // Stor økning: filmen bør ligge mellom start og desired, helst litt over midten
    // Dette sikrer en gradvis oppbygging, ikke et sjokk
    const idealValue = startValue + shift * 0.65;
    const diff = Math.abs(movieValue - idealValue);
    // Filmer under startpunktet er dårlige, filmer over desired er ok men ikke ideelle
    if (movieValue < startValue)
      return Math.max(0, 0.3 - (startValue - movieValue) / 10);
    return Math.max(0, 1 - diff / 6);
  }

  if (shift < 0) {
    // Stor nedgang: filmen bør ligge nærmere desired (den lave enden)
    const idealValue = endValue + absShift * 0.2;
    const diff = Math.abs(movieValue - idealValue);
    // Filmer over startpunktet er spesielt dårlige
    if (movieValue > startValue)
      return Math.max(0, 0.2 - (movieValue - startValue) / 10);
    return Math.max(0, 1 - diff / 6);
  }

  return 0.5;
}

// ============================
// KONSENTRASJON I KONTEKST
// Tar hensyn til nåværende humør
// ============================

function scoreConcentrationInContext(
  movie: Movie,
  concentration: "low" | "medium" | "high",
  currentMood: string | null,
): number {
  const baseTargets = { low: 3, medium: 5, high: 8 };
  let target = baseTargets[concentration];

  // Juster basert på nåværende humør
  if (currentMood) {
    // Sliten/stresset/urolig → senk kompleksitetstoleransen
    if (["tired", "stressed", "anxious", "scared"].includes(currentMood)) {
      target = Math.max(1, target - 1.5);
    }
    // Energisk/glad → øk toleransen litt
    if (["energetic", "happy"].includes(currentMood)) {
      target = Math.min(10, target + 1);
    }
    // Kjeder seg → øk toleransen, de trenger stimulering
    if (currentMood === "bored") {
      target = Math.min(10, target + 1.5);
    }
  }

  const diff = Math.abs(movie.mood.complexity - target);

  // Asymmetrisk: for komplekst er verre enn for enkelt
  if (movie.mood.complexity > target) {
    return Math.max(0, 1 - (diff * 1.8) / 7);
  }
  return Math.max(0, 1 - diff / 7);
}

// ============================
// SOSIAL KONTEKST I KONTEKST
// Tar hensyn til humør-reisen
// ============================

const SOCIAL_GENRE_SCORES: Record<string, Record<string, number>> = {
  alone: {
    drama: 0.9,
    thriller: 0.9,
    "sci-fi": 0.85,
    crime: 0.8,
    mystery: 0.85,
    horror: 0.8,
    documentary: 0.9,
    biography: 0.8,
    romance: 0.5,
    animation: 0.4,
  },
  partner: {
    romance: 0.95,
    drama: 0.85,
    comedy: 0.8,
    thriller: 0.7,
    mystery: 0.7,
    adventure: 0.7,
    horror: 0.65,
    "sci-fi": 0.6,
    animation: 0.5,
    documentary: 0.4,
  },
  friends: {
    comedy: 0.95,
    action: 0.9,
    adventure: 0.85,
    horror: 0.85,
    "sci-fi": 0.75,
    crime: 0.7,
    thriller: 0.7,
    romance: 0.3,
    documentary: 0.3,
  },
  family: {
    animation: 1.0,
    adventure: 0.9,
    comedy: 0.85,
    family: 1.0,
    fantasy: 0.85,
    musical: 0.9,
    horror: 0.1,
    crime: 0.2,
    thriller: 0.3,
  },
};

function scoreSocialInContext(
  movie: Movie,
  context: "alone" | "partner" | "friends" | "family",
  currentMood: string | null,
  desiredMood: string | null,
): number {
  const genre = movie.genre.map((g) => g.toLowerCase());

  const contextScores = SOCIAL_GENRE_SCORES[context];
  let bestScore = 0.5;

  for (const g of genre) {
    if (contextScores[g] && contextScores[g] > bestScore) {
      bestScore = contextScores[g];
    }
  }

  // Kontekst-spesifikke justeringer basert på humør-reise
  if (currentMood && desiredMood) {
    // Alene og trist → unngå romantikk, boost drama
    if (context === "alone" && currentMood === "sad") {
      if (genre.includes("romance")) bestScore *= 0.5;
      if (genre.includes("drama") && desiredMood === "moved") bestScore *= 1.2;
    }

    // Partner og vil ha spenning → thriller-date er bra
    if (
      context === "partner" &&
      ["thrilled", "scared", "tense"].includes(desiredMood)
    ) {
      if (genre.includes("thriller") || genre.includes("horror"))
        bestScore *= 1.3;
    }

    // Venner og noen er sliten → unngå komplekse filmer
    if (context === "friends" && currentMood === "tired") {
      if (genre.includes("documentary") || genre.includes("drama"))
        bestScore *= 0.6;
      if (genre.includes("comedy") || genre.includes("action"))
        bestScore *= 1.2;
    }

    // Familie og urolig → ekstra bonus for trygge filmer
    if (
      context === "family" &&
      ["anxious", "scared", "stressed"].includes(currentMood)
    ) {
      if (genre.includes("animation") || genre.includes("family"))
        bestScore *= 1.3;
      if (genre.includes("horror") || genre.includes("thriller"))
        bestScore *= 0.1;
    }

    // Alene og vil bli skremt → horror funker bedre alene
    if (context === "alone" && ["scared", "tense"].includes(desiredMood)) {
      if (genre.includes("horror")) bestScore *= 1.3;
      if (genre.includes("mystery")) bestScore *= 1.2;
    }

    // Venner og vil ha det gøy → comedy boost
    if (context === "friends" && ["amused", "uplifted"].includes(desiredMood)) {
      if (genre.includes("comedy")) bestScore *= 1.3;
    }
  }

  return Math.max(0, Math.min(1, bestScore));
}

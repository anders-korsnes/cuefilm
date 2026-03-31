import type { Movie, StreamingProvider } from "../types/movie";
import type { Country, Language } from "../types/criteria";
import { estimateMoodAdvanced } from "./moodEstimator";

const TOKEN = import.meta.env.VITE_TMDB_TOKEN;
if (!TOKEN) {
  console.error("VITE_TMDB_TOKEN is not set — TMDB API calls will fail");
}
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w300";

const headers: HeadersInit = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

async function tmdbFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`TMDB ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function searchPerson(name: string): Promise<number | null> {
  try {
    const data = await tmdbFetch<{ results?: { id: number }[] }>(
      `${BASE_URL}/search/person?query=${encodeURIComponent(name)}&page=1`,
    );
    return data.results?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

async function pooled<T>(tasks: (() => Promise<T>)[], concurrency = 6): Promise<T[]> {
  const results: T[] = [];
  const executing = new Set<Promise<void>>();

  for (const task of tasks) {
    const p = task().then((r) => {
      results.push(r);
      executing.delete(p);
    });
    executing.add(p);
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  await Promise.all(executing);
  return results;
}

const languageCodes: Record<Exclude<Language, "any">, string> = {
  english: "en",
  norwegian: "no",
  korean: "ko",
  japanese: "ja",
  french: "fr",
  spanish: "es",
  german: "de",
  italian: "it",
  hindi: "hi",
  portuguese: "pt",
  russian: "ru",
  chinese: "zh",
  arabic: "ar",
  turkish: "tr",
  polish: "pl",
  dutch: "nl",
  swedish: "sv",
  danish: "da",
  finnish: "fi",
  thai: "th",
  indonesian: "id",
  czech: "cs",
  greek: "el",
  hungarian: "hu",
  romanian: "ro",
  hebrew: "he",
  persian: "fa",
  vietnamese: "vi",
  ukrainian: "uk",
  malay: "ms",
};

const countryCodes: Record<Exclude<Country, "any">, string> = {
  american: "US",
  british: "GB",
  norwegian: "NO",
  korean: "KR",
  japanese: "JP",
  french: "FR",
  spanish: "ES",
  german: "DE",
  italian: "IT",
  indian: "IN",
  danish: "DK",
  swedish: "SE",
  brazilian: "BR",
  russian: "RU",
  chinese: "CN",
  australian: "AU",
  canadian: "CA",
  finnish: "FI",
  dutch: "NL",
  polish: "PL",
  turkish: "TR",
  thai: "TH",
  indonesian: "ID",
  czech: "CZ",
  greek: "GR",
  hungarian: "HU",
  romanian: "RO",
  israeli: "IL",
  iranian: "IR",
  argentinian: "AR",
  mexican: "MX",
  irish: "IE",
  newzealand: "NZ",
  belgian: "BE",
  austrian: "AT",
  swiss: "CH",
  portuguese: "PT",
  colombian: "CO",
  egyptian: "EG",
  nigerian: "NG",
  southafrican: "ZA",
};

type TmdbWatchProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string;
};

type TmdbWatchProviders = {
  results: Record<
    string,
    { flatrate?: TmdbWatchProvider[]; rent?: TmdbWatchProvider[] }
  >;
};

function extractProviders(
  data: { "watch/providers"?: TmdbWatchProviders },
  preferCountries = ["NO", "SE", "DK", "GB", "US"],
): StreamingProvider[] {
  const providerResults = data["watch/providers"]?.results;
  if (!providerResults) return [];
  for (const code of preferCountries) {
    const entry = providerResults[code];
    const flatrate = entry?.flatrate;
    if (flatrate && flatrate.length > 0) {
      return flatrate.slice(0, 5).map((p) => ({
        name: p.provider_name,
        logoPath: `https://image.tmdb.org/t/p/w45${p.logo_path}`,
      }));
    }
  }
  return [];
}

type TmdbKeywords = {
  keywords: { id: number; name: string }[];
};

type TmdbReleaseDates = {
  results: {
    iso_3166_1: string;
    release_dates: { certification: string }[];
  }[];
};

type TmdbMovie = {
  id: number;
  title: string;
  release_date: string;
  genre_ids: number[];
  overview: string;
  poster_path: string | null;
  vote_average: number;
  original_language: string;
};

type TmdbMovieDetail = {
  id: number;
  title: string;
  release_date: string;
  genres: { id: number; name: string }[];
  overview: string;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
  original_language: string;
  spoken_languages: { iso_639_1: string; english_name: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  credits?: {
    cast: { name: string }[];
    crew: { name: string; job: string }[];
  };
  keywords?: TmdbKeywords;
  release_dates?: TmdbReleaseDates;
  imdb_id: string | null;
  "watch/providers"?: TmdbWatchProviders;
};

function extractCertification(detail: TmdbMovieDetail): string {
  const us = detail.release_dates?.results?.find((r) => r.iso_3166_1 === "US");
  if (!us) return "";
  const cert = us.release_dates.find((r) => r.certification);
  return cert?.certification || "";
}

function mapDetailToMovie(detail: TmdbMovieDetail): Movie {
  const genres = detail.genres.map((g) => g.name);
  const director =
    detail.credits?.crew.find((c) => c.job === "Director")?.name || "Unknown";
  const actors = detail.credits?.cast.slice(0, 3).map((a) => a.name) || [];
  const languages = detail.spoken_languages
    .map((l) => l.english_name)
    .join(", ");
  const countries = detail.production_countries.map((c) => c.name).join(", ");
  const keywords = detail.keywords?.keywords?.map((k) => k.name) || [];
  const certification = extractCertification(detail);
  const rating = Math.round(detail.vote_average * 10) / 10;
  const runtime = detail.runtime || 0;

  return {
    id: detail.imdb_id || String(detail.id),
    title: detail.title,
    year: detail.release_date
      ? parseInt(detail.release_date.substring(0, 4))
      : 0,
    genre: genres,
    runtime,
    rating,
    voteCount: detail.vote_count,
    plot: detail.overview,
    poster: detail.poster_path ? `${IMG_BASE}${detail.poster_path}` : "",
    director,
    actors,
    language: languages,
    country: countries,
    mediaType: "movie",
    streamingProviders: extractProviders(detail),
    mood: estimateMoodAdvanced(
      genres,
      rating,
      runtime,
      keywords,
      certification,
      detail.overview,
    ),
  };
}

// ─── TV / Series ─────────────────────────────────────────────────────────────

type TmdbTvSimple = {
  id: number;
  name: string;
  first_air_date: string;
  genre_ids: number[];
  overview: string;
  poster_path: string | null;
  vote_average: number;
  original_language: string;
};

type TmdbTvDetail = {
  id: number;
  name: string;
  first_air_date: string;
  genres: { id: number; name: string }[];
  overview: string;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
  episode_run_time: number[];
  number_of_seasons: number;
  original_language: string;
  spoken_languages: { iso_639_1: string; english_name: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  credits?: {
    cast: { name: string }[];
    crew: { name: string; job: string }[];
  };
  keywords?: { results: { id: number; name: string }[] };
  content_ratings?: {
    results: { iso_3166_1: string; rating: string }[];
  };
  created_by?: { name: string }[];
  "watch/providers"?: TmdbWatchProviders;
};

function extractTvCertification(detail: TmdbTvDetail): string {
  const us = detail.content_ratings?.results?.find((r) => r.iso_3166_1 === "US");
  return us?.rating || "";
}

function mapTvDetailToMovie(detail: TmdbTvDetail): Movie {
  const genres = detail.genres.map((g) => g.name);
  const director = detail.created_by?.[0]?.name || "Unknown";
  const actors = detail.credits?.cast.slice(0, 3).map((a) => a.name) || [];
  const languages = detail.spoken_languages.map((l) => l.english_name).join(", ");
  const countries = detail.production_countries.map((c) => c.name).join(", ");
  const keywords = detail.keywords?.results?.map((k) => k.name) || [];
  const certification = extractTvCertification(detail);
  const rating = Math.round(detail.vote_average * 10) / 10;
  const runtime = detail.episode_run_time?.[0] || 0;

  return {
    id: String(detail.id),
    title: detail.name,
    year: detail.first_air_date ? parseInt(detail.first_air_date.substring(0, 4)) : 0,
    genre: genres,
    runtime,
    rating,
    voteCount: detail.vote_count,
    plot: detail.overview,
    poster: detail.poster_path ? `${IMG_BASE}${detail.poster_path}` : "",
    director,
    actors,
    language: languages,
    country: countries,
    mediaType: "series",
    numberOfSeasons: detail.number_of_seasons,
    streamingProviders: extractProviders(detail),
    mood: estimateMoodAdvanced(genres, rating, runtime, keywords, certification, detail.overview),
  };
}

export async function getTvById(
  tmdbId: number,
  appLanguage: string = "no",
): Promise<Movie | null> {
  try {
    const lang = appLanguage === "no" ? "no-NO" : "en-US";
    const data = await tmdbFetch<TmdbTvDetail>(
      `${BASE_URL}/tv/${tmdbId}?append_to_response=credits,keywords,content_ratings,watch/providers&language=${lang}`,
    );

    if (!data.overview && lang !== "en-US") {
      const fallbackData = await tmdbFetch<TmdbTvDetail>(
        `${BASE_URL}/tv/${tmdbId}?append_to_response=credits,keywords,content_ratings,watch/providers&language=en-US`,
      );
      data.overview = fallbackData.overview;
    }

    return mapTvDetailToMovie(data);
  } catch {
    return null;
  }
}

export async function discoverTv(
  language?: string,
  country?: string,
  yearFrom?: number,
  yearTo?: number,
  genreIds?: number[],
  page: number = 1,
  keywords?: number[],
  hiddenGem: boolean = false,
  appLanguage: string = "no",
): Promise<Movie[]> {
  try {
    const displayLang = appLanguage === "no" ? "no-NO" : "en-US";

    const params = new URLSearchParams({ page: String(page), language: displayLang });

    if (hiddenGem) {
      params.set("sort_by", "vote_average.desc");
      params.set("vote_count.gte", "100");
      params.set("vote_count.lte", "2000");
    } else {
      const sortOptions = getTvSortStrategy();
      params.set("sort_by", sortOptions.sortBy);
      params.set("vote_count.gte", sortOptions.minVotes);
    }

    if (language && language !== "any") {
      const code = languageCodes[language as Exclude<Language, "any">];
      if (code) params.set("with_original_language", code);
    }

    if (country && country !== "any") {
      const code = countryCodes[country as Exclude<Country, "any">];
      if (code) params.set("with_origin_country", code);
    }

    if (yearFrom) params.set("first_air_date.gte", `${yearFrom}-01-01`);
    if (yearTo) params.set("first_air_date.lte", `${yearTo}-12-31`);
    if (genreIds && genreIds.length > 0) params.set("with_genres", genreIds.join(","));
    if (keywords && keywords.length > 0) params.set("with_keywords", keywords.join("|"));

    const data = await tmdbFetch<{ results?: TmdbTvSimple[] }>(
      `${BASE_URL}/discover/tv?${params.toString()}`,
    );
    const results: TmdbTvSimple[] = data.results || [];

    const tasks = results.slice(0, 12).map((show) => () => getTvById(show.id, appLanguage));
    const shows = await pooled(tasks, 4);
    return shows.filter((s): s is Movie => s !== null);
  } catch {
    return [];
  }
}

export async function getMovieById(
  tmdbId: number,
  appLanguage: string = "no",
): Promise<Movie | null> {
  try {
    const lang = appLanguage === "no" ? "no-NO" : "en-US";
    const data = await tmdbFetch<TmdbMovieDetail>(
      `${BASE_URL}/movie/${tmdbId}?append_to_response=credits,keywords,release_dates,watch/providers&language=${lang}`,
    );

    if (!data.overview && lang !== "en-US") {
      const fallbackData = await tmdbFetch<TmdbMovieDetail>(
        `${BASE_URL}/movie/${tmdbId}?append_to_response=credits,keywords,release_dates,watch/providers&language=en-US`,
      );
      data.overview = fallbackData.overview;
    }

    return mapDetailToMovie(data);
  } catch {
    return null;
  }
}

export async function discoverMovies(
  language?: string,
  country?: string,
  yearFrom?: number,
  yearTo?: number,
  genreIds?: number[],
  page: number = 1,
  keywords?: number[],
  hiddenGem: boolean = false,
  appLanguage: string = "no",
  personIds?: number[],
): Promise<Movie[]> {
  try {
    const displayLang = appLanguage === "no" ? "no-NO" : "en-US";

    const params = new URLSearchParams({
      page: String(page),
      language: displayLang,
    });

    if (hiddenGem) {
      params.set("sort_by", "vote_average.desc");
      params.set("vote_count.gte", "200");
      params.set("vote_count.lte", "3000");
    } else {
      const sortOptions = getSortStrategy();
      params.set("sort_by", sortOptions.sortBy);
      params.set("vote_count.gte", sortOptions.minVotes);
    }

    if (language && language !== "any") {
      const code = languageCodes[language as Exclude<Language, "any">];
      if (code) params.set("with_original_language", code);
    }

    if (country && country !== "any") {
      const code = countryCodes[country as Exclude<Country, "any">];
      if (code) params.set("with_origin_country", code);
    }

    if (yearFrom) params.set("primary_release_date.gte", `${yearFrom}-01-01`);
    if (yearTo) params.set("primary_release_date.lte", `${yearTo}-12-31`);

    if (genreIds && genreIds.length > 0) {
      params.set("with_genres", genreIds.join(","));
    }

    if (keywords && keywords.length > 0) {
      params.set("with_keywords", keywords.join("|"));
    }

    if (personIds && personIds.length > 0) {
      params.set("with_people", personIds.join("|"));
    }

    const data = await tmdbFetch<{ results?: TmdbMovie[] }>(
      `${BASE_URL}/discover/movie?${params.toString()}`,
    );
    const results: TmdbMovie[] = data.results || [];

    const tasks = results
      .slice(0, 12)
      .map((movie) => () => getMovieById(movie.id, appLanguage));

    const movies = await pooled(tasks, 4);
    return movies.filter((m): m is Movie => m !== null);
  } catch {
    return [];
  }
}

function getSortStrategy(): { sortBy: string; minVotes: string } {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const dayOfMonth = now.getDate();

  const seed = day * 100 + hour * 4 + Math.floor(dayOfMonth / 7);

  const strategies = [
    { sortBy: "vote_average.desc", minVotes: "500" },
    { sortBy: "popularity.desc", minVotes: "500" },
    { sortBy: "primary_release_date.desc", minVotes: "500" },
    { sortBy: "revenue.desc", minVotes: "500" },
  ];

  let strategyPool: number[];
  if (hour >= 6 && hour < 12) {
    strategyPool = [0, 1];
  } else if (hour >= 12 && hour < 17) {
    strategyPool = [1, 2];
  } else if (hour >= 17 && hour < 22) {
    strategyPool = [0, 3];
  } else {
    strategyPool = [2, 0];
  }

  const index = seed % strategyPool.length;
  return strategies[strategyPool[index]];
}

function getTvSortStrategy(): { sortBy: string; minVotes: string } {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const dayOfMonth = now.getDate();

  const seed = day * 100 + hour * 4 + Math.floor(dayOfMonth / 7);

  // TV uses first_air_date instead of primary_release_date, and lower vote thresholds
  // Vote count is kept low (50) so recent shows (2024+) are included
  const strategies = [
    { sortBy: "vote_average.desc", minVotes: "50" },
    { sortBy: "popularity.desc", minVotes: "50" },
    { sortBy: "first_air_date.desc", minVotes: "50" },
  ];

  const index = seed % strategies.length;
  return strategies[index];
}

// TV genre IDs differ from movie genre IDs for some moods
const tvMoodGenres: Record<string, number[]> = {
  uplifted: [35, 10751, 18],
  relaxed: [35, 18, 10751],
  thrilled: [10759, 9648, 80],
  thoughtful: [18, 99, 36],
  amused: [35, 16, 10751],
  inspired: [18, 36, 10759],
  moved: [18, 10751, 10768],
  scared: [9648, 80, 10765],
  tense: [9648, 80, 10765],
};

const moodGenres: Record<string, number[]> = {
  uplifted: [35, 10751, 10749],
  relaxed: [10749, 35, 10402],
  thrilled: [28, 53, 80],
  thoughtful: [18, 99, 36],
  amused: [35, 16, 10751],
  inspired: [18, 36, 12],
  moved: [18, 10749, 10752],
  scared: [27, 53],
  tense: [53, 9648, 80],
};

const journeyKeywords: Record<string, number[]> = {
  // happy → desired
  happy_thrilled: [9882, 4565, 10617], // action hero, heist, chase
  happy_scared: [6152, 3133, 1299], // supernatural, haunted house, monster
  happy_amused: [9799, 9675, 2964], // romantic comedy, buddy, ensemble cast
  happy_uplifted: [9672, 3691, 4344], // feel good, friendship, underdog
  happy_moved: [2535, 9673, 240], // family relationships, loss, grief

  // sad → desired
  sad_uplifted: [9672, 4344, 9799], // feel good, underdog, heartwarming
  sad_amused: [9799, 9675, 167541], // romantic comedy, buddy, slapstick
  sad_moved: [2535, 240, 9673], // family relationships, grief, loss
  sad_relaxed: [15101, 3691, 12332], // healing, friendship, road trip

  // tired → desired
  tired_relaxed: [15101, 3691, 9799], // healing, friendship, romantic comedy
  tired_amused: [9799, 167541, 9675], // romantic comedy, slapstick, buddy
  tired_uplifted: [9672, 4344, 3691], // feel good, underdog, friendship
  tired_thrilled: [10617, 4565, 9748], // chase, heist, suspense

  // stressed → desired
  stressed_relaxed: [15101, 3691, 9672], // healing, friendship, feel good
  stressed_amused: [9799, 167541, 9675], // romantic comedy, slapstick, buddy
  stressed_uplifted: [9672, 4344, 9799], // feel good, underdog, heartwarming

  // bored → desired
  bored_thrilled: [9882, 4565, 10617], // action hero, heist, chase
  bored_scared: [6152, 3133, 1299], // supernatural, haunted house, monster
  bored_amused: [9799, 9675, 2964], // romantic comedy, buddy, ensemble
  bored_tense: [9748, 10714, 9672], // suspense, twist, whodunit

  // anxious → desired
  anxious_relaxed: [15101, 3691, 9672], // healing, friendship, feel good
  anxious_amused: [9799, 167541, 3691], // romantic comedy, slapstick, friendship
  anxious_uplifted: [9672, 4344, 3691], // feel good, underdog, friendship

  // energetic → desired
  energetic_thrilled: [9882, 4565, 10617], // action hero, heist, chase
  energetic_scared: [6152, 3133, 1299], // supernatural, haunted house, monster
  energetic_amused: [9799, 2964, 9675], // romantic comedy, ensemble, buddy

  // scared → desired
  scared_relaxed: [15101, 3691, 9672], // healing, friendship, feel good
  scared_amused: [9799, 167541, 3691], // romantic comedy, slapstick, friendship
  scared_scared: [6152, 3133, 1299], // supernatural, haunted house, monster
};

export async function searchByMood(
  desiredMood: string,
  language?: string,
  country?: string,
  yearFrom?: number,
  yearTo?: number,
  currentMood?: string,
  hiddenGem: boolean = false,
  appLanguage: string = "no",
  mediaType: "movie" | "series" | "both" = "movie",
): Promise<Movie[]> {
  const isTv = mediaType === "series";
  const isBoth = mediaType === "both";
  const genres = (isTv ? tvMoodGenres[desiredMood] : moodGenres[desiredMood]) || [];
  const tvGenres = tvMoodGenres[desiredMood] || [];
  if (genres.length === 0 && tvGenres.length === 0) return [];

  const discover = isTv ? discoverTv : discoverMovies;

  const journeyKey = currentMood ? `${currentMood}_${desiredMood}` : "";
  const keywords = journeyKey ? journeyKeywords[journeyKey] : undefined;

  const now = new Date();
  const timeSeed = now.getHours() + now.getDay() * 24 + now.getDate();
  const pageOffset = hiddenGem ? (timeSeed % 5) + 1 : (timeSeed % 3) + 1;

  const args = (g: number[] | undefined, page: number, kw?: number[]) =>
    [language, country, yearFrom, yearTo, g, page, kw, hiddenGem, appLanguage] as const;

  const seasonalGenres = getSeasonalGenres();

  const movieResults = !isTv
    ? await Promise.all([
        discover(...args(genres[0] !== undefined ? [genres[0]] : undefined, pageOffset, keywords)),
        discover(...args(genres[0] !== undefined ? [genres[0]] : undefined, pageOffset + 1)),
        genres[1] ? discover(...args([genres[1]], pageOffset)) : Promise.resolve([]),
        genres[2] ? discover(...args([genres[2]], pageOffset)) : Promise.resolve([]),
        keywords ? discover(...args(undefined, pageOffset, keywords)) : Promise.resolve([]),
        seasonalGenres.length > 0 ? discover(...args([seasonalGenres[0]], 1)) : Promise.resolve([]),
      ])
    : [];

  const tvResults = isTv || isBoth
    ? await Promise.all([
        discoverTv(...args(tvGenres[0] !== undefined ? [tvGenres[0]] : undefined, pageOffset, keywords)),
        discoverTv(...args(tvGenres[0] !== undefined ? [tvGenres[0]] : undefined, pageOffset + 1)),
        discoverTv(...args(tvGenres[0] !== undefined ? [tvGenres[0]] : undefined, pageOffset + 2)),
        tvGenres[1] ? discoverTv(...args([tvGenres[1]], pageOffset)) : Promise.resolve([]),
        tvGenres[1] ? discoverTv(...args([tvGenres[1]], pageOffset + 1)) : Promise.resolve([]),
        tvGenres[2] ? discoverTv(...args([tvGenres[2]], pageOffset)) : Promise.resolve([]),
        keywords ? discoverTv(...args(undefined, pageOffset, keywords)) : Promise.resolve([]),
      ])
    : [];

  const allMovies = [...movieResults.flat(), ...tvResults.flat()];

  return allMovies.filter(
    (movie, index, self) => self.findIndex((m) => m.id === movie.id) === index,
  );
}

function getSeasonalGenres(): number[] {
  const now = new Date();
  const month = now.getMonth();
  const dayOfMonth = now.getDate();

  // Høytider
  // Desember: jul → family, fantasy
  if (month === 11) return [10751, 14];
  // Oktober: halloween → horror
  if (month === 9) return [27];
  // Februar: valentine → romance
  if (month === 1 && dayOfMonth <= 20) return [10749];

  // Årstider
  if (month >= 5 && month <= 7) return [28, 12]; // Sommer: action, adventure
  if (month >= 8 && month <= 10) return [9648, 53]; // Høst: mystery, thriller
  if (month >= 11 || month <= 1) return [10751, 14]; // Vinter: family, fantasy
  return [10749, 35]; // Vår: romance, comedy
}

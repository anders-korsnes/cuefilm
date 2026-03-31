import type { Movie } from "../types/movie";
import type { UserCriteria } from "../types/criteria";
import { discoverMovies } from "./movieApi";
import { scoreMovies } from "./matchingEngine";

type TimeContext = {
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  dayOfWeek: "weekday" | "weekend";
  season: "winter" | "spring" | "summer" | "fall";
};

function getTimeContext(): TimeContext {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const month = now.getMonth();

  let timeOfDay: TimeContext["timeOfDay"];
  if (hour >= 6 && hour < 12) timeOfDay = "morning";
  else if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
  else if (hour >= 17 && hour < 22) timeOfDay = "evening";
  else timeOfDay = "night";

  const dayOfWeek: TimeContext["dayOfWeek"] =
    day === 0 || day === 6 ? "weekend" : "weekday";

  let season: TimeContext["season"];
  if (month >= 2 && month <= 4) season = "spring";
  else if (month >= 5 && month <= 7) season = "summer";
  else if (month >= 8 && month <= 10) season = "fall";
  else season = "winter";

  return { timeOfDay, dayOfWeek, season };
}

// Sjanger-preferanser basert på kontekst
function getContextGenres(context: TimeContext): number[] {
  const genres: number[] = [];

  // Tid på døgnet
  switch (context.timeOfDay) {
    case "morning":
      genres.push(35, 12, 16); // Comedy, Adventure, Animation
      break;
    case "afternoon":
      genres.push(28, 12, 878); // Action, Adventure, Sci-Fi
      break;
    case "evening":
      genres.push(18, 53, 10749); // Drama, Thriller, Romance
      break;
    case "night":
      genres.push(27, 53, 9648); // Horror, Thriller, Mystery
      break;
  }

  // Sesong-bonus
  switch (context.season) {
    case "winter":
      genres.push(10751, 14); // Family, Fantasy
      break;
    case "summer":
      genres.push(28, 12); // Action, Adventure
      break;
    case "fall":
      genres.push(27, 9648); // Horror, Mystery
      break;
    case "spring":
      genres.push(10749, 35); // Romance, Comedy
      break;
  }

  // Fjern duplikater
  return [...new Set(genres)];
}

function buildCriteriaFromHistory(
  history: UserCriteria[],
): Partial<UserCriteria> {
  if (history.length === 0) return {};

  // Finn mest brukte språk
  const langCounts: Record<string, number> = {};
  const countryCounts: Record<string, number> = {};
  let totalTime = 0;

  history.forEach((c) => {
    if (c.language && c.language !== "any") {
      langCounts[c.language] = (langCounts[c.language] || 0) + 1;
    }
    if (c.country && c.country !== "any") {
      countryCounts[c.country] = (countryCounts[c.country] || 0) + 1;
    }
    totalTime += c.availableTime;
  });

  const topLang = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0];
  const topCountry = Object.entries(countryCounts).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const avgTime = Math.round(totalTime / history.length);

  return {
    language: topLang ? (topLang[0] as UserCriteria["language"]) : undefined,
    country: topCountry
      ? (topCountry[0] as UserCriteria["country"])
      : undefined,
    availableTime: avgTime || 120,
  };
}

export function generateContextExplanation(context: TimeContext): string {
  const parts: string[] = [];

  switch (context.timeOfDay) {
    case "morning":
      parts.push("Det er morgen — noe lett og energisk for å starte dagen.");
      break;
    case "afternoon":
      parts.push("Midt på dagen — perfekt for noe engasjerende.");
      break;
    case "evening":
      parts.push(
        "Det er kveld — tid for å lene seg tilbake med noe skikkelig.",
      );
      break;
    case "night":
      parts.push("Sen kveld — stemningen er satt for noe mørkt eller intenst.");
      break;
  }

  switch (context.season) {
    case "winter":
      parts.push("Vinteren kaller på varme historier og magiske verdener.");
      break;
    case "spring":
      parts.push("Våren passer for noe ferskt og optimistisk.");
      break;
    case "summer":
      parts.push("Sommer betyr eventyr og action.");
      break;
    case "fall":
      parts.push("Høsten er mystikk og ettertanke.");
      break;
  }

  switch (context.dayOfWeek) {
    case "weekend":
      parts.push("Helg — du har tid til noe lengre.");
      break;
    case "weekday":
      parts.push("Hverdag — noe som passer innenfor kvelden.");
      break;
  }

  return parts.join(" ");
}

export async function getRandomPick(
  searchHistory: UserCriteria[],
): Promise<{ movie: Movie; score: number; explanation: string } | null> {
  const context = getTimeContext();
  const genres = getContextGenres(context);
  const prefs = buildCriteriaFromHistory(searchHistory);

  try {
    // Søk med kontekst-baserte sjangre
    const primaryGenre =
      genres[Math.floor(Math.random() * Math.min(3, genres.length))];
    const randomPage = Math.floor(Math.random() * 5) + 1;

    const movies = await discoverMovies(
      prefs.language,
      prefs.country,
      undefined,
      undefined,
      [primaryGenre],
      randomPage,
    );

    if (movies.length === 0) return null;

    // Bygg midlertidige kriterier basert på kontekst for scoring
    const tempCriteria: UserCriteria = {
      currentMood: null,
      desiredMood: null,
      availableTime: prefs.availableTime || 120,
      concentration: context.timeOfDay === "night" ? "low" : "medium",
      socialContext: context.dayOfWeek === "weekend" ? "friends" : "alone",
      yearRange: [1970, new Date().getFullYear()],
      language: prefs.language || "any",
      country: prefs.country || "any",
    };

    // Velg tilfeldig fra topp-halvdelen
    const scored = scoreMovies(movies, tempCriteria);
    const topHalf = scored.slice(0, Math.max(3, Math.floor(scored.length / 2)));
    const randomIndex = Math.floor(Math.random() * topHalf.length);
    const pick = topHalf[randomIndex];

    const explanation = generateContextExplanation(context);

    return {
      movie: pick.movie,
      score: pick.score,
      explanation,
    };
  } catch (err) {
    console.error("Random pick failed:", err);
    return null;
  }
}

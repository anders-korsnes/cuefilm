import type { MoodProfile } from "../types/movie";

// Keywords fra TMDB som sterkt indikerer mood
const keywordSignals: Record<string, Partial<MoodProfile>> = {
  // Emosjonelt tunge
  death: { emotional: 2, feelGoodFactor: -2 },
  grief: { emotional: 3, feelGoodFactor: -2, energy: -1 },
  "loss of loved one": { emotional: 3, feelGoodFactor: -2 },
  tragedy: { emotional: 2, feelGoodFactor: -3 },
  dying: { emotional: 2, feelGoodFactor: -2 },
  suicide: { emotional: 3, feelGoodFactor: -3 },
  depression: { emotional: 2, feelGoodFactor: -2, energy: -1 },
  loneliness: { emotional: 2, feelGoodFactor: -1, energy: -1 },

  // Varme / emosjonelt positive
  love: { emotional: 2, feelGoodFactor: 1 },
  friendship: { emotional: 1, feelGoodFactor: 2 },
  "feel good": { feelGoodFactor: 3, tension: -2 },
  underdog: { feelGoodFactor: 2, emotional: 1 },
  "coming of age": { emotional: 1, feelGoodFactor: 1, complexity: 1 },
  "happy ending": { feelGoodFactor: 2 },
  redemption: { emotional: 2, feelGoodFactor: 2 },
  "family relationships": { emotional: 2, feelGoodFactor: 1 },
  reunion: { emotional: 1, feelGoodFactor: 2 },
  wedding: { feelGoodFactor: 2, emotional: 1 },

  // Høy tension / spenning
  "serial killer": { tension: 3, feelGoodFactor: -2, energy: 1 },
  kidnapping: { tension: 3, energy: 1 },
  survival: { tension: 2, energy: 2 },
  conspiracy: { tension: 2, complexity: 2 },
  "twist ending": { tension: 1, complexity: 2 },
  suspense: { tension: 2 },
  murder: { tension: 2, feelGoodFactor: -1 },
  psychopath: { tension: 3, feelGoodFactor: -2 },
  stalker: { tension: 3, feelGoodFactor: -2 },
  hostage: { tension: 3, energy: 1 },
  paranoia: { tension: 2, complexity: 1 },

  // Horror-spesifikke
  "haunted house": { tension: 3, energy: 1, feelGoodFactor: -2 },
  supernatural: { tension: 2, complexity: 1 },
  zombie: { tension: 2, energy: 2, feelGoodFactor: -1 },
  monster: { tension: 2, energy: 2 },
  ghost: { tension: 2, feelGoodFactor: -1 },
  demon: { tension: 3, feelGoodFactor: -2 },
  slasher: { tension: 3, energy: 2, feelGoodFactor: -3 },

  // Høy kompleksitet
  "nonlinear timeline": { complexity: 3, energy: -1 },
  philosophical: { complexity: 3, emotional: 1 },
  dystopia: { complexity: 2, feelGoodFactor: -1 },
  political: { complexity: 2 },
  "ambiguous ending": { complexity: 2, tension: 1 },
  "plot twist": { complexity: 2, tension: 1 },
  dream: { complexity: 2 },
  "time travel": { complexity: 2, energy: 1 },
  "parallel universe": { complexity: 2 },
  "unreliable narrator": { complexity: 3 },

  // Rolig / lav energi
  "slow motion": { energy: -1 },
  meditation: { energy: -2, tension: -2 },
  nature: { energy: -1, tension: -1, feelGoodFactor: 1 },
  "road trip": { energy: 1, feelGoodFactor: 1, tension: -1 },
  "small town": { energy: -1, tension: -1 },
  countryside: { energy: -1, feelGoodFactor: 1 },

  // Høy energi / action
  "car chase": { energy: 3, tension: 2 },
  explosion: { energy: 3, tension: 1 },
  "martial arts": { energy: 3, tension: 1 },
  heist: { energy: 2, tension: 2, complexity: 1 },
  "sword fight": { energy: 3, tension: 1 },
  shootout: { energy: 3, tension: 2 },
  race: { energy: 3, tension: 1 },
  boxing: { energy: 3, tension: 2, emotional: 1 },
  war: { energy: 2, tension: 2, emotional: 2, feelGoodFactor: -1 },

  // Humor
  parody: { feelGoodFactor: 2, tension: -1, complexity: -1 },
  slapstick: { feelGoodFactor: 2, energy: 2, complexity: -2 },
  "dark humor": { feelGoodFactor: 1, complexity: 1 },
  satire: { complexity: 2, feelGoodFactor: 1 },
  "romantic comedy": { feelGoodFactor: 2, emotional: 1, tension: -1 },
};

// Aldersgrense som mood-signal
const certificationSignals: Record<string, Partial<MoodProfile>> = {
  G: { feelGoodFactor: 2, tension: -2, complexity: -2, energy: -1 },
  PG: { feelGoodFactor: 1, tension: -1, complexity: -1 },
  "PG-13": {},
  R: { tension: 1, emotional: 1, feelGoodFactor: -1 },
  "NC-17": { tension: 2, emotional: 2, feelGoodFactor: -2 },
};

// Plot-ord som indikerer mood
const overviewSignals = {
  dark: {
    words: [
      "murder",
      "death",
      "kill",
      "dead",
      "die",
      "blood",
      "revenge",
      "betray",
      "destroy",
      "victim",
    ],
    signal: { feelGoodFactor: -1, tension: 1 } as Partial<MoodProfile>,
  },
  warm: {
    words: [
      "love",
      "friendship",
      "family",
      "together",
      "hope",
      "dream",
      "heart",
      "home",
      "bond",
      "care",
    ],
    signal: { feelGoodFactor: 1, emotional: 1 } as Partial<MoodProfile>,
  },
  intense: {
    words: [
      "escape",
      "chase",
      "survive",
      "fight",
      "race",
      "hunt",
      "battle",
      "attack",
      "danger",
      "threat",
    ],
    signal: { energy: 1, tension: 1 } as Partial<MoodProfile>,
  },
  calm: {
    words: [
      "journey",
      "discover",
      "learn",
      "grow",
      "quiet",
      "small town",
      "peaceful",
      "gentle",
      "simple",
    ],
    signal: { energy: -1, tension: -1 } as Partial<MoodProfile>,
  },
  complex: {
    words: [
      "mystery",
      "secret",
      "hidden",
      "truth",
      "uncover",
      "conspiracy",
      "puzzle",
      "clue",
      "investigate",
    ],
    signal: { complexity: 1, tension: 1 } as Partial<MoodProfile>,
  },
  funny: {
    words: [
      "hilarious",
      "funny",
      "comedy",
      "laugh",
      "absurd",
      "chaos",
      "prank",
      "misadventure",
      "outrageous",
    ],
    signal: {
      feelGoodFactor: 1,
      energy: 1,
      tension: -1,
    } as Partial<MoodProfile>,
  },
};

function applySignal(
  profile: MoodProfile,
  signal: Partial<MoodProfile>,
): MoodProfile {
  return {
    energy: profile.energy + (signal.energy || 0),
    emotional: profile.emotional + (signal.emotional || 0),
    complexity: profile.complexity + (signal.complexity || 0),
    feelGoodFactor: profile.feelGoodFactor + (signal.feelGoodFactor || 0),
    tension: profile.tension + (signal.tension || 0),
  };
}

function clampProfile(profile: MoodProfile): MoodProfile {
  const clamp = (val: number) => Math.max(1, Math.min(10, Math.round(val)));
  return {
    energy: clamp(profile.energy),
    emotional: clamp(profile.emotional),
    complexity: clamp(profile.complexity),
    feelGoodFactor: clamp(profile.feelGoodFactor),
    tension: clamp(profile.tension),
  };
}

function analyzeOverview(profile: MoodProfile, overview: string): MoodProfile {
  const lower = overview.toLowerCase();
  let result = profile;

  for (const category of Object.values(overviewSignals)) {
    const matchCount = category.words.filter((w) => lower.includes(w)).length;
    if (matchCount >= 2) {
      result = applySignal(result, category.signal);
    }
    // Sterkere signal ved mange treff
    if (matchCount >= 4) {
      result = applySignal(result, category.signal);
    }
  }

  return result;
}

export function estimateMoodAdvanced(
  genres: string[],
  rating: number,
  runtime: number,
  keywords: string[],
  certification: string,
  overview: string,
): MoodProfile {
  // Lag 1: Sjanger-base
  let profile = estimateFromGenres(genres, rating, runtime);

  // Lag 2: Keywords (sterkeste signal)
  for (const keyword of keywords) {
    const signal = keywordSignals[keyword.toLowerCase()];
    if (signal) {
      profile = applySignal(profile, signal);
    }
  }

  // Lag 3: Aldersgrense
  const certSignal = certificationSignals[certification];
  if (certSignal) {
    profile = applySignal(profile, certSignal);
  }

  // Lag 4: Plot-analyse
  profile = analyzeOverview(profile, overview);

  return clampProfile(profile);
}

function estimateFromGenres(
  genres: string[],
  rating: number,
  runtime: number,
): MoodProfile {
  const lowerGenres = genres.map((g) => g.toLowerCase());

  let energy = 5;
  let emotional = 5;
  let complexity = 5;
  let feelGoodFactor = 5;
  let tension = 5;

  if (lowerGenres.includes("action")) {
    energy += 3;
    tension += 2;
  }
  if (lowerGenres.includes("comedy")) {
    feelGoodFactor += 2;
    energy += 1;
    emotional -= 1;
  }
  if (lowerGenres.includes("drama")) {
    emotional += 2;
    complexity += 1;
  }
  if (lowerGenres.includes("horror")) {
    tension += 4;
    feelGoodFactor -= 3;
    energy += 2;
  }
  if (lowerGenres.includes("thriller")) {
    tension += 3;
    energy += 2;
  }
  if (lowerGenres.includes("romance")) {
    emotional += 2;
    feelGoodFactor += 2;
    tension -= 1;
  }
  if (lowerGenres.includes("sci-fi")) {
    complexity += 2;
    energy += 1;
  }
  if (lowerGenres.includes("animation")) {
    feelGoodFactor += 2;
    complexity -= 1;
    tension -= 1;
  }
  if (lowerGenres.includes("adventure")) {
    energy += 2;
    feelGoodFactor += 1;
  }
  if (lowerGenres.includes("crime")) {
    tension += 2;
    complexity += 1;
    feelGoodFactor -= 1;
  }
  if (lowerGenres.includes("documentary")) {
    complexity += 3;
    energy -= 2;
    tension -= 2;
  }
  if (lowerGenres.includes("musical")) {
    energy += 1;
    feelGoodFactor += 3;
    tension -= 2;
  }
  if (lowerGenres.includes("mystery")) {
    tension += 2;
    complexity += 2;
  }
  if (lowerGenres.includes("war")) {
    emotional += 3;
    tension += 2;
    feelGoodFactor -= 2;
  }
  if (lowerGenres.includes("fantasy")) {
    energy += 1;
    feelGoodFactor += 1;
    complexity += 1;
  }
  if (lowerGenres.includes("history")) {
    complexity += 2;
    emotional += 1;
    energy -= 1;
  }
  if (lowerGenres.includes("family")) {
    feelGoodFactor += 3;
    tension -= 2;
    complexity -= 1;
  }
  if (lowerGenres.includes("western")) {
    tension += 1;
    energy += 1;
  }
  if (lowerGenres.includes("music")) {
    feelGoodFactor += 2;
    tension -= 1;
    energy += 1;
  }

  // Sjanger-kombinasjoner
  if (lowerGenres.includes("horror") && lowerGenres.includes("comedy")) {
    tension -= 1;
    feelGoodFactor += 1;
  }
  if (lowerGenres.includes("crime") && lowerGenres.includes("comedy")) {
    tension -= 1;
    energy += 1;
  }
  if (lowerGenres.includes("drama") && lowerGenres.includes("romance")) {
    feelGoodFactor += 1;
    tension -= 1;
  }

  if (rating >= 8.0) {
    complexity += 1;
    emotional += 1;
  }
  if (runtime > 150) {
    complexity += 1;
    energy -= 1;
  }
  if (runtime < 95) {
    energy += 1;
  }

  const clamp = (val: number) => Math.max(1, Math.min(10, val));
  return {
    energy: clamp(energy),
    emotional: clamp(emotional),
    complexity: clamp(complexity),
    feelGoodFactor: clamp(feelGoodFactor),
    tension: clamp(tension),
  };
}

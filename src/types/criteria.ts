export type CurrentMood =
  | "happy"
  | "sad"
  | "stressed"
  | "bored"
  | "tired"
  | "anxious"
  | "energetic"
  | "scared";

export type DesiredMood =
  | "uplifted"
  | "relaxed"
  | "thrilled"
  | "thoughtful"
  | "amused"
  | "inspired"
  | "moved"
  | "scared"
  | "tense";

export type Concentration = "low" | "medium" | "high";

export type SocialContext = "alone" | "partner" | "friends" | "family";

export type Language =
  | "any"
  | "english"
  | "norwegian"
  | "korean"
  | "japanese"
  | "french"
  | "spanish"
  | "german"
  | "italian"
  | "hindi"
  | "portuguese"
  | "russian"
  | "chinese"
  | "arabic"
  | "turkish"
  | "polish"
  | "dutch"
  | "swedish"
  | "danish"
  | "finnish"
  | "thai"
  | "indonesian"
  | "czech"
  | "greek"
  | "hungarian"
  | "romanian"
  | "hebrew"
  | "persian"
  | "vietnamese"
  | "ukrainian"
  | "malay";

export type Country =
  | "any"
  | "american"
  | "british"
  | "norwegian"
  | "korean"
  | "japanese"
  | "french"
  | "spanish"
  | "german"
  | "italian"
  | "indian"
  | "danish"
  | "swedish"
  | "brazilian"
  | "russian"
  | "chinese"
  | "australian"
  | "canadian"
  | "finnish"
  | "dutch"
  | "polish"
  | "turkish"
  | "thai"
  | "indonesian"
  | "czech"
  | "greek"
  | "hungarian"
  | "romanian"
  | "israeli"
  | "iranian"
  | "argentinian"
  | "mexican"
  | "irish"
  | "newzealand"
  | "belgian"
  | "austrian"
  | "swiss"
  | "portuguese"
  | "colombian"
  | "egyptian"
  | "nigerian"
  | "southafrican";

export type MediaType = "movie" | "series" | "both";

export type UserCriteria = {
  currentMood: CurrentMood | null;
  desiredMood: DesiredMood | null;
  availableTime: number;
  concentration: Concentration | null;
  socialContext: SocialContext | null;
  mediaType: MediaType;
  yearRange: [number, number];
  language: Language;
  country: Country;
};

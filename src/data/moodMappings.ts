import type { MoodProfile } from "../types/movie";
import type { CurrentMood, DesiredMood } from "../types/criteria";

export type MoodOption<T> = {
  value: T;
  emoji: string;
  translationKey: string;
};

export const currentMoodOptions: MoodOption<CurrentMood>[] = [
  { value: "happy", emoji: "😊", translationKey: "mood.happy" },
  { value: "sad", emoji: "😢", translationKey: "mood.sad" },
  { value: "stressed", emoji: "😤", translationKey: "mood.stressed" },
  { value: "bored", emoji: "🥱", translationKey: "mood.bored" },
  { value: "tired", emoji: "😴", translationKey: "mood.tired" },
  { value: "anxious", emoji: "😰", translationKey: "mood.anxious" },
  { value: "energetic", emoji: "⚡", translationKey: "mood.energetic" },
  { value: "scared", emoji: "😨", translationKey: "mood.scared" },
];

export const desiredMoodOptions: MoodOption<DesiredMood>[] = [
  { value: "uplifted", emoji: "🌟", translationKey: "mood.uplifted" },
  { value: "relaxed", emoji: "😌", translationKey: "mood.relaxed" },
  { value: "thrilled", emoji: "🎢", translationKey: "mood.thrilled" },
  { value: "thoughtful", emoji: "🤔", translationKey: "mood.thoughtful" },
  { value: "amused", emoji: "😄", translationKey: "mood.amused" },
  { value: "inspired", emoji: "💡", translationKey: "mood.inspired" },
  { value: "moved", emoji: "🥺", translationKey: "mood.moved" },
  { value: "scared", emoji: "😱", translationKey: "mood.desiredScared" },
  { value: "tense", emoji: "😰", translationKey: "mood.tense" },
];

// Mood profiles uendret
export const currentMoodProfiles: Record<CurrentMood, MoodProfile> = {
  happy: {
    energy: 7,
    emotional: 3,
    complexity: 5,
    feelGoodFactor: 8,
    tension: 5,
  },
  sad: {
    energy: 3,
    emotional: 8,
    complexity: 4,
    feelGoodFactor: 7,
    tension: 2,
  },
  stressed: {
    energy: 2,
    emotional: 3,
    complexity: 2,
    feelGoodFactor: 9,
    tension: 1,
  },
  bored: {
    energy: 7,
    emotional: 5,
    complexity: 6,
    feelGoodFactor: 5,
    tension: 7,
  },
  tired: {
    energy: 2,
    emotional: 3,
    complexity: 2,
    feelGoodFactor: 8,
    tension: 1,
  },
  anxious: {
    energy: 2,
    emotional: 4,
    complexity: 2,
    feelGoodFactor: 9,
    tension: 1,
  },
  energetic: {
    energy: 9,
    emotional: 5,
    complexity: 6,
    feelGoodFactor: 6,
    tension: 7,
  },
  scared: {
    energy: 3,
    emotional: 5,
    complexity: 2,
    feelGoodFactor: 8,
    tension: 1,
  },
};

export const desiredMoodProfiles: Record<DesiredMood, MoodProfile> = {
  uplifted: {
    energy: 5,
    emotional: 5,
    complexity: 3,
    feelGoodFactor: 10,
    tension: 3,
  },
  relaxed: {
    energy: 2,
    emotional: 3,
    complexity: 2,
    feelGoodFactor: 8,
    tension: 1,
  },
  thrilled: {
    energy: 9,
    emotional: 6,
    complexity: 5,
    feelGoodFactor: 5,
    tension: 9,
  },
  thoughtful: {
    energy: 3,
    emotional: 7,
    complexity: 8,
    feelGoodFactor: 5,
    tension: 3,
  },
  amused: {
    energy: 6,
    emotional: 2,
    complexity: 2,
    feelGoodFactor: 9,
    tension: 2,
  },
  inspired: {
    energy: 5,
    emotional: 6,
    complexity: 6,
    feelGoodFactor: 8,
    tension: 3,
  },
  moved: {
    energy: 3,
    emotional: 10,
    complexity: 5,
    feelGoodFactor: 4,
    tension: 3,
  },
  scared: {
    energy: 7,
    emotional: 6,
    complexity: 3,
    feelGoodFactor: 1,
    tension: 10,
  },
  tense: {
    energy: 5,
    emotional: 5,
    complexity: 6,
    feelGoodFactor: 2,
    tension: 9,
  },
};

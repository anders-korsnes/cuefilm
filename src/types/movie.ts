export type MoodProfile = {
  energy: number;
  emotional: number;
  complexity: number;
  feelGoodFactor: number;
  tension: number;
};

export type Movie = {
  id: string;
  title: string;
  year: number;
  genre: string[];
  runtime: number;
  rating: number;
  voteCount: number;
  plot: string;
  poster: string;
  director: string;
  actors: string[];
  language: string;
  country: string;
  mood: MoodProfile;
  mediaType: "movie" | "series";
  numberOfSeasons?: number;
  streamingProviders?: StreamingProvider[];
};

export type StreamingProvider = {
  name: string;
  logoPath: string;
};

export type SnapshotStreamingProvider = {
  name: string;
  logoPath: string;
};

export type MovieSnapshot = {
  id: string;
  title: string;
  year: number;
  genre: string[];
  runtime: number;
  rating: number;
  voteCount: number;
  poster: string;
  language: string;
  country: string;
  mediaType: "movie" | "series";
  numberOfSeasons?: number;
  plot?: string;
  director?: string;
  actors?: string[];
  streamingProviders?: SnapshotStreamingProvider[];
};

export type UserMovie = {
  movieId: string;
  saved: boolean;
  watched: boolean;
  watchedDate?: string;
  chosen: boolean;
  chosenDate?: string;
  disliked: boolean;
  personalRating?: number;
  movieSnapshot?: MovieSnapshot;
};

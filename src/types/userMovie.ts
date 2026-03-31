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
};

export type UserMovie = {
  movieId: string;
  saved: boolean;
  watched: boolean;
  watchedDate?: string;
  personalRating?: number;
  movieSnapshot?: MovieSnapshot;
};

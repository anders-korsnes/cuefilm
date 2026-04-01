import mongoose from "mongoose";

const recommendedMovieSchema = new mongoose.Schema(
  {
    movieId: String,
    title: String,
    year: Number,
    poster: String,
    score: Number,
  },
  { _id: false },
);

const schema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    criteria: {
      currentMood: String,
      desiredMood: String,
      concentration: String,
      socialContext: String,
      mediaType: String,
      availableTime: Number,
      yearFrom: Number,
      yearTo: Number,
      language: String,
      country: String,
    },
    topRecommendations: [recommendedMovieSchema],
    isRandom: { type: Boolean, default: false },
    isHiddenGem: { type: Boolean, default: false },
  },
  { timestamps: true },
);

schema.index({ userId: 1, createdAt: -1 });

export const SearchHistory = mongoose.model("SearchHistory", schema);

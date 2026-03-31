import mongoose from "mongoose";

const movieSnapshotSchema = new mongoose.Schema(
  {
    id: String,
    title: String,
    year: Number,
    genre: [String],
    runtime: Number,
    rating: Number,
    voteCount: Number,
    poster: String,
    language: String,
    country: String,
    mediaType: String,
    numberOfSeasons: Number,
  },
  { _id: false },
);

const schema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    movieId: { type: String, required: true },
    saved: { type: Boolean, default: false },
    watched: { type: Boolean, default: false },
    watchedDate: { type: Date },
    personalRating: { type: Number, min: 0, max: 10 },
    movieSnapshot: { type: movieSnapshotSchema },
  },
  { timestamps: true },
);

// Ensure one entry per user per movie
schema.index({ userId: 1, movieId: 1 }, { unique: true });

export const LibraryEntry = mongoose.model("LibraryEntry", schema);

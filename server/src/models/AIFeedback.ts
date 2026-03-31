import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    movieId: { type: String, required: true },
    movieTitle: { type: String },
    feedback: { type: String, enum: ["up", "down"], required: true },
  },
  { timestamps: true },
);

schema.index({ userId: 1, movieId: 1 }, { unique: true });

export const AIFeedback = mongoose.model("AIFeedback", schema);

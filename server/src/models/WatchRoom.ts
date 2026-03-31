import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 50 },
    currentMood: String,
    desiredMood: String,
    concentration: String,
    socialContext: String,
    availableTime: { type: Number, default: 180 },
    mediaType: { type: String, default: "both" },
  },
  { _id: false },
);

const schema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    hostUserId: String,
    participants: [participantSchema],
    status: {
      type: String,
      enum: ["waiting", "ready", "closed"],
      default: "waiting",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);

export const WatchRoom = mongoose.model("WatchRoom", schema);

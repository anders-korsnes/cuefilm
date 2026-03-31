import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { timestamps: true },
);

schema.index({ userId: 1, endpoint: 1 }, { unique: true });

export const PushSubscription = mongoose.model("PushSubscription", schema);

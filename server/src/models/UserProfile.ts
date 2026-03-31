import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    name: { type: String, default: "", maxlength: 100 },
    email: { type: String, default: "", maxlength: 254 },
    username: { type: String, default: "", maxlength: 50 },
    age: { type: String, default: "", maxlength: 3 },
    gender: { type: String, default: null },
    avatarUrl: { type: String, default: null, maxlength: 2048 },
  },
  { timestamps: true },
);

export const UserProfile = mongoose.model("UserProfile", schema);

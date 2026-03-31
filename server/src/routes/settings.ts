import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { z } from "zod";
import { UserProfile } from "../models/UserProfile.js";

const router = Router();

router.use(requireAuth());

const profileSchema = z.object({
  name: z.string().max(100).default(""),
  email: z.string().email().max(254).or(z.literal("")).default(""),
  username: z.string().max(50).default(""),
  age: z.string().max(3).default(""),
  gender: z.enum(["male", "female", "other", "prefer-not"]).nullable().default(null),
  avatarUrl: z.string().url().max(2048).nullable().or(z.literal("")).default(null),
});

router.get("/", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const profile = await UserProfile.findOne({ userId });
    res.json(
      profile ?? { name: "", email: "", username: "", age: "", gender: null, avatarUrl: null },
    );
  } catch (err) {
    console.error("Failed to fetch profile:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.put("/", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid profile data", details: parsed.error.flatten() });
      return;
    }

    const { name, email, username, age, gender, avatarUrl } = parsed.data;

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { name, email, username, age, gender, avatarUrl },
      { upsert: true, new: true },
    );
    res.json(profile);
  } catch (err) {
    console.error("Failed to update profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;

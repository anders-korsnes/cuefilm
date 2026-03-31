import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { z } from "zod";
import { SearchHistory } from "../models/SearchHistory.js";

const router = Router();

router.use(requireAuth());

const saveSearchSchema = z.object({
  criteria: z.object({
    currentMood: z.string().nullable(),
    desiredMood: z.string().nullable(),
    concentration: z.string().nullable(),
    socialContext: z.string().nullable(),
    mediaType: z.string(),
  }),
  topRecommendations: z
    .array(
      z.object({
        movieId: z.string(),
        title: z.string(),
        year: z.number(),
        poster: z.string(),
        score: z.number(),
      }),
    )
    .max(5),
  isRandom: z.boolean().optional(),
  isHiddenGem: z.boolean().optional(),
});

router.post("/", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const parsed = saveSearchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const entry = await SearchHistory.create({
      userId,
      ...parsed.data,
    });
    res.status(201).json(entry);
  } catch (err) {
    console.error("Failed to save search history:", err);
    res.status(500).json({ error: "Failed to save search history" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    const entries = await SearchHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(entries);
  } catch (err) {
    console.error("Failed to fetch search history:", err);
    res.status(500).json({ error: "Failed to fetch search history" });
  }
});

export default router;

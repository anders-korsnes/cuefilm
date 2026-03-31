import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { z } from "zod";
import { LibraryEntry } from "../models/LibraryEntry.js";

const router = Router();

router.use(requireAuth());

const movieSnapshotSchema = z.object({
  id: z.string().max(50),
  title: z.string().max(300),
  year: z.number(),
  genre: z.array(z.string().max(50)).max(10),
  runtime: z.number(),
  rating: z.number(),
  voteCount: z.number(),
  poster: z.string().max(500),
  language: z.string().max(200),
  country: z.string().max(200),
  mediaType: z.string().max(20),
  numberOfSeasons: z.number().optional(),
}).optional();

const toggleBodySchema = z.object({
  movieSnapshot: movieSnapshotSchema,
}).optional();

const movieIdSchema = z.string().min(1).max(50);

router.get("/", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 200);

    const entries = await LibraryEntry.find({ userId })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json(entries);
  } catch (err) {
    console.error("Failed to fetch library:", err);
    res.status(500).json({ error: "Failed to fetch library" });
  }
});

router.post("/toggle-save/:movieId", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const movieIdResult = movieIdSchema.safeParse(req.params.movieId);
    if (!movieIdResult.success) {
      res.status(400).json({ error: "Invalid movie ID" });
      return;
    }
    const movieId = movieIdResult.data;

    const body = toggleBodySchema.safeParse(req.body);
    const movieSnapshot = body.success ? body.data?.movieSnapshot : undefined;

    const existing = await LibraryEntry.findOne({ userId, movieId });
    if (existing) {
      existing.saved = !existing.saved;
      if (movieSnapshot && !existing.movieSnapshot) {
        existing.movieSnapshot = movieSnapshot;
      }
      await existing.save();
      res.json(existing);
    } else {
      const entry = await LibraryEntry.create({
        userId,
        movieId,
        saved: true,
        watched: false,
        movieSnapshot,
      });
      res.status(201).json(entry);
    }
  } catch (err) {
    console.error("Failed to toggle save:", err);
    res.status(500).json({ error: "Failed to toggle save" });
  }
});

router.post("/toggle-watched/:movieId", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const movieIdResult = movieIdSchema.safeParse(req.params.movieId);
    if (!movieIdResult.success) {
      res.status(400).json({ error: "Invalid movie ID" });
      return;
    }
    const movieId = movieIdResult.data;

    const body = toggleBodySchema.safeParse(req.body);
    const movieSnapshot = body.success ? body.data?.movieSnapshot : undefined;

    const existing = await LibraryEntry.findOne({ userId, movieId });
    if (existing) {
      existing.watched = !existing.watched;
      existing.watchedDate = existing.watched ? new Date() : undefined;
      if (movieSnapshot && !existing.movieSnapshot) {
        existing.movieSnapshot = movieSnapshot;
      }
      await existing.save();
      res.json(existing);
    } else {
      const entry = await LibraryEntry.create({
        userId,
        movieId,
        saved: false,
        watched: true,
        watchedDate: new Date(),
        movieSnapshot,
      });
      res.status(201).json(entry);
    }
  } catch (err) {
    console.error("Failed to toggle watched:", err);
    res.status(500).json({ error: "Failed to toggle watched" });
  }
});

export default router;

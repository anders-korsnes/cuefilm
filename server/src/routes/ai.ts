import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { z } from "zod";
import { AIFeedback } from "../models/AIFeedback.js";

const router = Router();

router.use(requireAuth());

function sanitize(str: string, maxLen = 500): string {
  return String(str ?? "").slice(0, maxLen).replace(/[<>]/g, "");
}

router.post("/explain", async (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "AI service not configured" });
    return;
  }

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { movie, criteria, language, likedMovies } = req.body ?? {};

    if (
      !movie?.title ||
      !movie?.year ||
      !Array.isArray(movie?.genre) ||
      typeof movie?.rating !== "number"
    ) {
      res.status(400).json({ error: "Invalid movie data" });
      return;
    }

    const lang = language === "no" ? "Norwegian" : "English";

    const safeTitle = sanitize(movie.title, 200);
    const safeGenre = movie.genre.slice(0, 5).map((g: string) => sanitize(g, 50)).join("/");
    const safePlot = sanitize(movie.plot ?? "", 200);

    let libraryContext = "";
    if (Array.isArray(likedMovies) && likedMovies.length > 0) {
      const titles = likedMovies
        .slice(0, 5)
        .map((m: { title?: string; year?: number }) => `${sanitize(m.title ?? "", 100)} (${m.year ?? ""})`)
        .join(", ");
      libraryContext = `\nThe user has previously enjoyed: ${titles}. Reference these if relevant to explain why this recommendation fits their taste.`;
    }

    const prompt = `You are a warm, knowledgeable movie recommender. In 2-3 sentences in ${lang}, explain why "${safeTitle}" (${movie.year}) is a great pick for someone who:
- Currently feels: ${sanitize(criteria?.currentMood ?? "not specified", 100)}
- Wants to feel: ${sanitize(criteria?.desiredMood ?? "not specified", 100)}
- Concentration level: ${sanitize(criteria?.concentration ?? "not specified", 100)}
- Watching with: ${sanitize(criteria?.socialContext ?? "not specified", 100)}

The movie is a ${safeGenre} rated ${movie.rating}/10. Plot: ${safePlot}
${libraryContext}
Be specific about WHY this movie fits their emotional journey. Don't just describe the movie — connect it to their mood. Keep it personal and conversational. No quotation marks around the response.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error("OpenRouter error:", response.status, response.statusText);
      res.status(502).json({ error: "AI service error" });
      return;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    res.json({ explanation: text.trim() });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      res.status(504).json({ error: "AI request timed out" });
      return;
    }
    console.error("AI explain error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const feedbackSchema = z.object({
  movieId: z.string().max(50),
  movieTitle: z.string().max(300).optional(),
  feedback: z.enum(["up", "down"]),
});

router.post("/feedback", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const parsed = feedbackSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid feedback data" });
      return;
    }

    await AIFeedback.findOneAndUpdate(
      { userId, movieId: parsed.data.movieId },
      { ...parsed.data, userId },
      { upsert: true, new: true },
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("AI feedback error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

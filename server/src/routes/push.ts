import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { z } from "zod";
import { PushSubscription } from "../models/PushSubscription.js";

const router = Router();

router.use(requireAuth());

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

router.post("/subscribe", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const parsed = subscribeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid subscription data" });
      return;
    }

    await PushSubscription.findOneAndUpdate(
      { userId, endpoint: parsed.data.endpoint },
      { userId, ...parsed.data },
      { upsert: true },
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("Failed to save push subscription:", err);
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

router.delete("/unsubscribe", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    await PushSubscription.deleteMany({ userId });
    res.json({ ok: true });
  } catch (err) {
    console.error("Failed to remove push subscription:", err);
    res.status(500).json({ error: "Failed to remove subscription" });
  }
});

export default router;

import { Router } from "express";
import { getAuth } from "@clerk/express";
import { z } from "zod";
import crypto from "crypto";
import { WatchRoom } from "../models/WatchRoom.js";

const router = Router();

function generateCode(): string {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

const createRoomSchema = z.object({
  name: z.string().min(1).max(50),
  currentMood: z.string().nullable().optional(),
  desiredMood: z.string().nullable().optional(),
  concentration: z.string().nullable().optional(),
  availableTime: z.number().min(30).max(480).optional(),
  mediaType: z.string().optional(),
});

const joinRoomSchema = z.object({
  name: z.string().min(1).max(50),
  currentMood: z.string().nullable().optional(),
  desiredMood: z.string().nullable().optional(),
  concentration: z.string().nullable().optional(),
  availableTime: z.number().min(30).max(480).optional(),
  mediaType: z.string().optional(),
});

router.post("/create", async (req, res) => {
  try {
    const auth = getAuth(req);
    const parsed = createRoomSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const code = generateCode();
    const participant = {
      name: parsed.data.name,
      currentMood: parsed.data.currentMood || undefined,
      desiredMood: parsed.data.desiredMood || undefined,
      concentration: parsed.data.concentration || undefined,
      availableTime: parsed.data.availableTime || 180,
      mediaType: parsed.data.mediaType || "both",
    };

    const room = await WatchRoom.create({
      code,
      hostUserId: auth.userId || undefined,
      participants: [participant],
      status: "waiting",
    });

    res.status(201).json({ code: room.code, room });
  } catch (err) {
    console.error("Failed to create room:", err);
    res.status(500).json({ error: "Failed to create room" });
  }
});

router.get("/:code", async (req, res) => {
  try {
    const room = await WatchRoom.findOne({
      code: req.params.code.toUpperCase(),
    });
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    res.json(room);
  } catch (err) {
    console.error("Failed to fetch room:", err);
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

router.post("/:code/join", async (req, res) => {
  try {
    const parsed = joinRoomSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const room = await WatchRoom.findOne({
      code: req.params.code.toUpperCase(),
      status: "waiting",
    });
    if (!room) {
      res.status(404).json({ error: "Room not found or already closed" });
      return;
    }

    if (room.participants.length >= 8) {
      res.status(400).json({ error: "Room is full" });
      return;
    }

    room.participants.push({
      name: parsed.data.name,
      currentMood: parsed.data.currentMood || undefined,
      desiredMood: parsed.data.desiredMood || undefined,
      concentration: parsed.data.concentration || undefined,
      availableTime: parsed.data.availableTime || 180,
      mediaType: parsed.data.mediaType || "both",
    });

    await room.save();
    res.json(room);
  } catch (err) {
    console.error("Failed to join room:", err);
    res.status(500).json({ error: "Failed to join room" });
  }
});

router.post("/:code/ready", async (req, res) => {
  try {
    const room = await WatchRoom.findOne({
      code: req.params.code.toUpperCase(),
    });
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    room.status = "ready";
    await room.save();
    res.json(room);
  } catch (err) {
    console.error("Failed to update room:", err);
    res.status(500).json({ error: "Failed to update room" });
  }
});

export default router;

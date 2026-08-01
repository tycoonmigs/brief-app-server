// src/routes/roomRoutes.js
import express from 'express';
import Room from '../models/Room.js';
import generateRoomCode from '../utils/generateRoomCode.js';
import { createRoomLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const ROOM_DURATION_MS = 1 * 60 * 60 * 1000; // 1 hour

// POST /api/rooms  — create a new room
router.post('/', createRoomLimiter, async (req, res) => {
  try {
    const code = generateRoomCode();
    const expiresAt = new Date(Date.now() + ROOM_DURATION_MS);

    const room = await Room.create({ code, expiresAt });

    res.status(201).json({ code: room.code, expiresAt: room.expiresAt });
  } catch (error) {
    res.status(500).json({ error: 'Could not create room' });
  }
});

// GET /api/rooms/:code — check if a room code is valid before joining
router.get('/:code', async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code });

    if (!room) {
      return res.status(404).json({ error: 'Room not found or expired' });
    }

    res.json({ code: room.code, expiresAt: room.expiresAt });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
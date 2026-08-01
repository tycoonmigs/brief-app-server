// src/routes/roomRoutes.js
import express from 'express';
import Room from '../models/Room.js';
import generateRoomCode from '../utils/generateRoomCode.js';
import { createRoomLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const ROOM_DURATION_MS = 1 * 60 * 60 * 1000; // 1 hour

router.post('/', createRoomLimiter, async (req, res) => {
  try {
    const code = generateRoomCode(10);
    const creatorToken = generateRoomCode(32); // longer, private — never shared via the room code/link
    const expiresAt = new Date(Date.now() + ROOM_DURATION_MS);

    const room = await Room.create({ code, creatorToken, expiresAt });

    // creatorToken is returned ONLY here, to the person who just created the room —
    // it is never included in any other response (e.g. the GET /:code lookup below)
    res.status(201).json({ code: room.code, expiresAt: room.expiresAt, creatorToken: room.creatorToken });
  } catch (error) {
    res.status(500).json({ error: 'Could not create room' });
  }
});

router.get('/:code', async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code });

    if (!room) {
      return res.status(404).json({ error: 'Room not found or expired' });
    }

    // deliberately NOT including creatorToken here — anyone joining via code should never see it
    res.json({ code: room.code, expiresAt: room.expiresAt });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
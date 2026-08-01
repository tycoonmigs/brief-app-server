// src/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

// General API rate limiter — applies to REST routes
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // max 20 requests per IP per minute
  message: { error: 'Too many requests, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter specifically for room creation
export const createRoomLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // max 5 room creations per IP per 5 min
  message: { error: 'Too many rooms created. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// simple in-memory tracker for socket message rate limiting
const messageTimestamps = new Map();

export const isMessageRateLimited = (socketId) => {
  const now = Date.now();
  const windowMs = 10 * 1000; // 10 seconds
  const maxMessages = 15;

  const timestamps = messageTimestamps.get(socketId) || [];
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= maxMessages) {
    return true; // rate limited
  }

  recent.push(now);
  messageTimestamps.set(socketId, recent);
  return false;
};
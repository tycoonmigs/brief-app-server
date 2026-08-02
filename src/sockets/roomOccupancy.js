// src/sockets/roomOccupancy.js
import Room from '../models/Room.js';
import Message from '../models/Message.js';

const roomSockets = new Map(); // roomCode -> Set of socket ids
const pendingCleanups = new Map(); // roomCode -> setTimeout handle

const MAX_OCCUPANTS = 2;
const EMPTY_ROOM_GRACE_MS = 30 * 1000; // 30 seconds — enough for a refresh/brief disconnect to recover

export const canJoinRoom = (roomCode) => {
  const occupants = roomSockets.get(roomCode);
  return !occupants || occupants.size < MAX_OCCUPANTS;
};

export const addOccupant = (roomCode, socketId) => {
  if (!roomSockets.has(roomCode)) {
    roomSockets.set(roomCode, new Set());
  }
  roomSockets.get(roomCode).add(socketId);

  // someone (re)joined — cancel any pending deletion for this room
  if (pendingCleanups.has(roomCode)) {
    clearTimeout(pendingCleanups.get(roomCode));
    pendingCleanups.delete(roomCode);
  }
};

export const removeOccupant = (roomCode, socketId) => {
  const occupants = roomSockets.get(roomCode);
  if (!occupants) return;

  occupants.delete(socketId);

  if (occupants.size === 0) {
    roomSockets.delete(roomCode);
    scheduleEmptyRoomCleanup(roomCode);
  }
};

const scheduleEmptyRoomCleanup = (roomCode) => {
  // avoid scheduling duplicate cleanups if this somehow fires more than once
  if (pendingCleanups.has(roomCode)) return;

  const timeout = setTimeout(async () => {
    pendingCleanups.delete(roomCode);

    // double check the room is STILL empty right before deleting —
    // someone may have rejoined in the time since this was scheduled
    if (roomSockets.has(roomCode)) return;

    try {
      const room = await Room.findOne({ code: roomCode });
      if (!room) return; // already gone (e.g. expired via TTL, or terminated manually)

      await Message.deleteMany({ roomId: room._id });
      await Room.deleteOne({ _id: room._id });

      console.log(`Empty room ${roomCode} auto-deleted after grace period`);
    } catch (error) {
      console.error(`Error auto-deleting empty room ${roomCode}:`, error);
    }
  }, EMPTY_ROOM_GRACE_MS);

  pendingCleanups.set(roomCode, timeout);
};
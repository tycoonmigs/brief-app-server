// src/sockets/roomOccupancy.js
// tracks which socket IDs are currently active in each room, in memory.
// this is intentionally NOT stored in MongoDB — it's live connection state,
// not persistent data, and should vanish the moment the server restarts or a socket drops.

const roomSockets = new Map(); // roomCode -> Set of socket ids

const MAX_OCCUPANTS = 2;

export const canJoinRoom = (roomCode) => {
  const occupants = roomSockets.get(roomCode);
  return !occupants || occupants.size < MAX_OCCUPANTS;
};

export const addOccupant = (roomCode, socketId) => {
  if (!roomSockets.has(roomCode)) {
    roomSockets.set(roomCode, new Set());
  }
  roomSockets.get(roomCode).add(socketId);
};

export const removeOccupant = (roomCode, socketId) => {
  const occupants = roomSockets.get(roomCode);
  if (!occupants) return;

  occupants.delete(socketId);

  if (occupants.size === 0) {
    roomSockets.delete(roomCode); // clean up empty entries so this Map doesn't grow forever
  }
};
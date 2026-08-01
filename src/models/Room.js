// src/models/Room.js
import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// TTL index: MongoDB automatically deletes this document
// once the current time passes the value in `expiresAt`.
// expireAfterSeconds: 0 means "delete exactly at the timestamp
// stored in expiresAt" (not 0 seconds after creation).
roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Room = mongoose.model('Room', roomSchema);

export default Room;
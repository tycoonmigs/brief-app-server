// src/models/Room.js
import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  creatorToken: {
    type: String,
    required: true,
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

roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Room = mongoose.model('Room', roomSchema);

export default Room;
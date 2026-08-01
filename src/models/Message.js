// src/models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  alias: {
    type: String,
    required: true,
  },
  content: {
    type: String, // text content, or base64 data for small files/images (v1)
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text',
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

// Same TTL pattern as Room — each message deletes itself
// independently once its own expiresAt passes.
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Speeds up "get all messages for this room" queries, which
// we'll run constantly (every time someone joins/loads a room).
messageSchema.index({ roomId: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
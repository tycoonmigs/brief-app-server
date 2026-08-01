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
    type: String,
  },
  fileName: {
    type: String, // only used for type: 'file' — original filename for display
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text',
  },
  reactions: [
    {
      alias: { type: String, required: true },
      emoji: { type: String, required: true },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
messageSchema.index({ roomId: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
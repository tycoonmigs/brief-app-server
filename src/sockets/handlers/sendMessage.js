// src/sockets/handlers/sendMessage.js (full updated version)
import Room from '../../models/Room.js';
import Message from '../../models/Message.js';
import { isMessageRateLimited } from '../../middleware/rateLimiter.js';
import { sanitizeMessageContent } from '../../middleware/sanitizeInput.js';
import { validateBase64File } from '../../middleware/fileValidation.js';

const sendMessage = (io, socket) => {
  socket.on('sendMessage', async ({ content, type = 'text' }) => {
    try {
      if (isMessageRateLimited(socket.id)) {
        socket.emit('errorMessage', { error: 'You are sending messages too fast.' });
        return;
      }

      const { alias, roomCode } = socket.data;
      if (!alias || !roomCode) return;

      const room = await Room.findOne({ code: roomCode });
      if (!room) return;

      let finalContent;

      if (type === 'text') {
        finalContent = sanitizeMessageContent(content);
        if (!finalContent) return;
      } else if (type === 'image' || type === 'file') {
        const validation = validateBase64File(content);
        if (!validation.valid) {
          socket.emit('errorMessage', { error: validation.error });
          return;
        }
        finalContent = content; // already validated, store as-is
      } else {
        return; // unknown type, reject silently
      }

      const message = await Message.create({
        roomId: room._id,
        alias,
        content: finalContent,
        type,
        expiresAt: room.expiresAt,
      });

      io.to(roomCode).emit('newMessage', {
        alias: message.alias,
        content: message.content,
        type: message.type,
        createdAt: message.createdAt,
      });
    } catch (error) {
      socket.emit('errorMessage', { error: 'Message failed to send' });
    }
  });
};

export default sendMessage;
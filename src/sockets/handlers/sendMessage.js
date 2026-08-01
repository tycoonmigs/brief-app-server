// src/sockets/handlers/sendMessage.js
import Room from '../../models/Room.js';
import Message from '../../models/Message.js';
import { isMessageRateLimited } from '../../middleware/rateLimiter.js';
import { sanitizeMessageContent } from '../../middleware/sanitizeInput.js';
import { validateBase64File } from '../../middleware/fileValidation.js';

const sendMessage = (io, socket) => {
  socket.on('sendMessage', async ({ content, type = 'text', fileName }) => {
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
      let finalFileName;

      if (type === 'text') {
        finalContent = sanitizeMessageContent(content);
        if (!finalContent) return;
      } else if (type === 'image') {
        const validation = validateBase64File(content, 'image');
        if (!validation.valid) {
          socket.emit('errorMessage', { error: validation.error });
          return;
        }
        finalContent = content;
      } else if (type === 'file') {
        const validation = validateBase64File(content, 'file');
        if (!validation.valid) {
          socket.emit('errorMessage', { error: validation.error });
          return;
        }
        finalContent = content;
        finalFileName = sanitizeMessageContent(fileName || 'file'); // sanitize the filename too — it's user-controlled text
      } else {
        return;
      }

      const message = await Message.create({
        roomId: room._id,
        alias,
        content: finalContent,
        fileName: finalFileName,
        type,
        expiresAt: room.expiresAt,
      });

      io.to(roomCode).emit('newMessage', {
        id: message._id.toString(),
        alias: message.alias,
        content: message.content,
        fileName: message.fileName,
        type: message.type,
        reactions: message.reactions,
        createdAt: message.createdAt,
      });
    } catch (error) {
      socket.emit('errorMessage', { error: 'Message failed to send' });
    }
  });
};

export default sendMessage;
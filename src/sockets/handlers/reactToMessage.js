// src/sockets/handlers/reactToMessage.js
import Message from '../../models/Message.js';

// mirrors src/utils/emojiList.js on the client — kept in sync manually
// since client and server are separate projects
const ALLOWED_REACTIONS = [
  '😀', '😂', '😍', '😎', '😢', '😮', '🙏', '🔥',
  '🎉', '😅', '🤔', '😴', '👀', '💯', '👍', '❤️',
  '😡', '👏', '🙌', '😱', '🥳', '😭', '🤝', '👌',
];

const reactToMessage = (io, socket) => {
  socket.on('reactToMessage', async ({ messageId, emoji }) => {
    try {
      const { alias, roomCode } = socket.data;
      if (!alias || !roomCode) return;
      if (!ALLOWED_REACTIONS.includes(emoji)) return;

      const message = await Message.findById(messageId);
      if (!message) return;

      const existingIndex = message.reactions.findIndex((r) => r.alias === alias);

      if (existingIndex !== -1 && message.reactions[existingIndex].emoji === emoji) {
        message.reactions.splice(existingIndex, 1);
      } else if (existingIndex !== -1) {
        message.reactions[existingIndex].emoji = emoji;
      } else {
        message.reactions.push({ alias, emoji });
      }

      await message.save();

      io.to(roomCode).emit('reactionUpdate', {
        messageId: message._id.toString(),
        reactions: message.reactions,
      });
    } catch (error) {
      socket.emit('errorMessage', { error: 'Could not react to message' });
    }
  });
};

export default reactToMessage;
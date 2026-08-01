// src/sockets/handlers/joinRoom.js
import Room from '../../models/Room.js';
import Message from '../../models/Message.js';
import generateAlias from '../../utils/generateAlias.js';

const joinRoom = (io, socket) => {
  socket.on('joinRoom', async ({ code }, callback) => {
    try {
      const room = await Room.findOne({ code });

      if (!room) {
        return callback({ error: 'Room not found or expired' });
      }

      // assign this socket an alias for this session
      const alias = generateAlias();
      socket.data.alias = alias;
      socket.data.roomCode = code;

      socket.join(code); // Socket.io's built-in room grouping

      // load existing messages so the joining user sees chat history
      const messages = await Message.find({ roomId: room._id }).sort({ createdAt: 1 });

      callback({
        alias,
        expiresAt: room.expiresAt,
        messages,
      });

      // tell everyone else in the room someone joined
      socket.to(code).emit('userJoined', { alias });
    } catch (error) {
      callback({ error: 'Something went wrong joining the room' });
    }
  });
};

export default joinRoom;
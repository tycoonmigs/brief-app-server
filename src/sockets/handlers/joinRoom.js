// src/sockets/handlers/joinRoom.js
import Room from '../../models/Room.js';
import Message from '../../models/Message.js';
import generateAlias from '../../utils/generateAlias.js';
import { canJoinRoom, addOccupant } from '../roomOccupancy.js';

const joinRoom = (io, socket) => {
  socket.on('joinRoom', async ({ code }, callback) => {
    try {
      const room = await Room.findOne({ code });

      if (!room) {
        return callback({ error: 'Room not found or expired' });
      }

      if (!canJoinRoom(code)) {
        return callback({
          error: 'room-full',
          message: 'This is a private 2-person room, and it already has 2 people chatting.',
        });
      }

      const alias = generateAlias();
      socket.data.alias = alias;
      socket.data.roomCode = code;

      socket.join(code);
      addOccupant(code, socket.id);

      const rawMessages = await Message.find({ roomId: room._id }).sort({ createdAt: 1 });
      const messages = rawMessages.map((m) => ({
        id: m._id.toString(),
        alias: m.alias,
        content: m.content,
        fileName: m.fileName,
        type: m.type,
        reactions: m.reactions,
        createdAt: m.createdAt,
      }));

      callback({
        alias,
        expiresAt: room.expiresAt,
        messages,
      });

      socket.to(code).emit('userJoined', { alias });
    } catch (error) {
      callback({ error: 'Something went wrong joining the room' });
    }
  });
};

export default joinRoom;
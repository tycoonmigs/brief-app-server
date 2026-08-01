// src/sockets/handlers/terminateRoom.js
import Room from '../../models/Room.js';
import Message from '../../models/Message.js';

const terminateRoom = (io, socket) => {
  socket.on('terminateRoom', async ({ creatorToken }) => {
    try {
      const { roomCode } = socket.data;
      if (!roomCode || !creatorToken) return;

      const room = await Room.findOne({ code: roomCode });
      if (!room) return;

      if (room.creatorToken !== creatorToken) {
        socket.emit('errorMessage', { error: 'Not authorized to terminate this room' });
        return;
      }

      // delete messages first, then the room itself — explicit cleanup rather than
      // waiting on the TTL sweep, since this is a deliberate user action
      await Message.deleteMany({ roomId: room._id });
      await Room.deleteOne({ _id: room._id });

      io.to(roomCode).emit('roomTerminated');
    } catch (error) {
      socket.emit('errorMessage', { error: 'Could not terminate room' });
    }
  });
};

export default terminateRoom;
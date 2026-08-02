// src/sockets/handlers/disconnect.js
import { removeOccupant } from '../roomOccupancy.js';

const disconnectHandler = (io, socket) => {
  socket.on('disconnect', () => {
    const { alias, roomCode } = socket.data;

    if (roomCode) {
      removeOccupant(roomCode, socket.id);
    }

    if (alias && roomCode) {
      socket.to(roomCode).emit('userLeft', { alias });
    }
  });
};

export default disconnectHandler;
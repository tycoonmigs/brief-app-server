// src/sockets/handlers/disconnect.js
const disconnectHandler = (io, socket) => {
  socket.on('disconnect', () => {
    const { alias, roomCode } = socket.data;
    if (alias && roomCode) {
      socket.to(roomCode).emit('userLeft', { alias });
    }
  });
};

export default disconnectHandler;
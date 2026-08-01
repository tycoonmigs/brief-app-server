// src/sockets/handlers/typing.js
const typing = (io, socket) => {
  socket.on('typing', () => {
    const { alias, roomCode } = socket.data;
    if (!alias || !roomCode) return;

    // broadcast to everyone EXCEPT the sender
    socket.to(roomCode).emit('userTyping', { alias });
  });

  socket.on('stopTyping', () => {
    const { alias, roomCode } = socket.data;
    if (!alias || !roomCode) return;

    socket.to(roomCode).emit('userStoppedTyping', { alias });
  });
};

export default typing;
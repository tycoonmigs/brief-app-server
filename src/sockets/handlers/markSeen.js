// src/sockets/handlers/markSeen.js
const markSeen = (io, socket) => {
  socket.on('markSeen', ({ lastSeenMessageId }) => {
    const { alias, roomCode } = socket.data;
    if (!alias || !roomCode || !lastSeenMessageId) return;

    // broadcast to everyone else in the room — tells them "this alias has seen up to this message"
    socket.to(roomCode).emit('seenUpdate', { alias, lastSeenMessageId });
  });
};

export default markSeen;
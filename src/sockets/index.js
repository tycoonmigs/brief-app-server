// src/sockets/index.js
import { Server } from 'socket.io';
import corsOptions from '../config/corsOptions.js';
import joinRoom from './handlers/joinRoom.js';
import sendMessage from './handlers/sendMessage.js';
import typing from './handlers/typing.js';
import disconnectHandler from './handlers/disconnect.js';

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: corsOptions,
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    joinRoom(io, socket);
    sendMessage(io, socket);
    typing(io, socket);
    disconnectHandler(io, socket);
  });

  return io;
};
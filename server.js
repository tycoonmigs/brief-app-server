// server.js
import 'dotenv/config'; // must be the very first import — loads .env before any other file reads process.env
import http from 'http';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { initSocket } from './src/sockets/index.js';

const server = http.createServer(app);

// Socket.io needs the raw HTTP server (not the Express app)
// so it can hijack the connection for WebSocket upgrades.
initSocket(server);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
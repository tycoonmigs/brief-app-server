// src/app.js (updated)
import express from 'express';
import cors from 'cors';
import corsOptions from './config/corsOptions.js';
import roomRoutes from './routes/roomRoutes.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const app = express();

app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use('/api', apiLimiter); // applies to all /api routes

app.use('/api/rooms', roomRoutes);

app.get('/', (req, res) => {
  res.send('Brief server is running.');
});

export default app;
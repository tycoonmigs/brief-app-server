// src/config/corsOptions.js
const allowedOrigins = [process.env.CLIENT_URL];

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like Postman, curl) during dev
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

export default corsOptions;
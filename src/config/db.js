// src/config/db.js
import mongoose from 'mongoose';
import dns from 'dns';

// Force Node's DNS resolver to use Google's DNS servers directly,
// bypassing whatever the OS/router is failing to resolve correctly.
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1); // stop the server if we can't connect to the DB
  }
};

export default connectDB;
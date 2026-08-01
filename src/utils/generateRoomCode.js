// src/utils/generateRoomCode.js
import crypto from 'crypto';

const generateRoomCode = (length = 10) => {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

export default generateRoomCode;
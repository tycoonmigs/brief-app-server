// src/utils/generateRoomCode.js
import crypto from 'crypto';

const generateRoomCode = (length = 10) => {
  // crypto.randomBytes is cryptographically secure — unlike Math.random(),
  // it can't be predicted or reverse-engineered, which matters since
  // this code is effectively the only "password" protecting a room.
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

export default generateRoomCode;
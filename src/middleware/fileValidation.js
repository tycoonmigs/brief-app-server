// src/middleware/fileValidation.js
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'text/plain',
  'application/zip',
];

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB — same limit for both images and files

export const validateBase64File = (base64String, expectedCategory) => {
  const match = base64String.match(/^data:([a-zA-Z0-9/+.-]+);base64,(.+)$/);

  if (!match) {
    return { valid: false, error: 'Invalid file format' };
  }

  const mimeType = match[1];
  const base64Data = match[2];

  const allowedList = expectedCategory === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_FILE_TYPES;

  if (!allowedList.includes(mimeType)) {
    return { valid: false, error: 'File type not allowed' };
  }

  const sizeInBytes = (base64Data.length * 3) / 4;

  if (sizeInBytes > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File too large (max 2MB)' };
  }

  return { valid: true, mimeType };
};
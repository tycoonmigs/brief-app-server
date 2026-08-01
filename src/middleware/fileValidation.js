// src/middleware/fileValidation.js
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export const validateBase64File = (base64String) => {
  // expects format like: data:image/png;base64,iVBORw0KGgo...
  const match = base64String.match(/^data:([a-zA-Z0-9/+.-]+);base64,(.+)$/);

  if (!match) {
    return { valid: false, error: 'Invalid file format' };
  }

  const mimeType = match[1];
  const base64Data = match[2];

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return { valid: false, error: 'File type not allowed' };
  }

  // base64 encoding inflates size by ~33% — approximate the real byte size
  const sizeInBytes = (base64Data.length * 3) / 4;

  if (sizeInBytes > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File too large (max 2MB)' };
  }

  return { valid: true, mimeType };
};
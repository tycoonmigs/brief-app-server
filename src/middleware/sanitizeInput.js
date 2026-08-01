// src/middleware/sanitizeInput.js
import sanitizeHtml from 'sanitize-html';

export const sanitizeMessageContent = (content) => {
  if (typeof content !== 'string') return '';

  return sanitizeHtml(content, {
    allowedTags: [], // strip ALL html tags — this is a plain-text chat app
    allowedAttributes: {},
  }).trim();
};
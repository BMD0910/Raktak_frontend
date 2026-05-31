export function sanitizeText(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim();
}

export function sanitizeEmail(value) {
  return sanitizeText(value).toLowerCase();
}

export function sanitizeQuery(value) {
  return sanitizeText(value).slice(0, 120);
}

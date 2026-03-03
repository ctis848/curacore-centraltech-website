export function validateRequestKey(key: string) {
  // Example format: 32–64 chars, uppercase, alphanumeric + dashes
  const pattern = /^[A-Z0-9\-]{32,64}$/;

  return pattern.test(key.trim());
}

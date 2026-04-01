const rateLimitMap = new Map<
  string,
  { count: number; start: number }
>();

export function rateLimit(ip: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };

  if (now - entry.start > windowMs) {
    entry.count = 1;
    entry.start = now;
  } else {
    entry.count++;
  }

  rateLimitMap.set(ip, entry);

  return entry.count <= limit;
}

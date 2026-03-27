export function getBrowserSessionToken() {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

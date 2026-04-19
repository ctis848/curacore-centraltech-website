// FILE: lib/license/generator.ts
export function generateLicenseKey() {
  const part = () => Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${part()}-${part()}-${part()}`;
}

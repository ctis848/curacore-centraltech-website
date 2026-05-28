export function generateInvoiceNumber(companyId: string) {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  // Example: CC-2026-05-COMP123
  return `CC-${year}-${month}-${companyId}`;
}

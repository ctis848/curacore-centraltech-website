import { baseEmailTemplate } from "./baseTemplate";

export function paymentReceiptTemplate(amount: number, invoiceId: string) {
  return baseEmailTemplate({
    title: "Payment Receipt",
    message: `
      <p>Hello,</p>
      <p>We have received your payment.</p>
      <p><strong>Amount:</strong> ₦${amount.toLocaleString()}</p>
      <p><strong>Invoice ID:</strong> ${invoiceId}</p>
      <p>Thank you for your business.</p>
    `,
  });
}

interface ReceiptPayload {
  to: string;
  amount: number;
  currency: string;
  reference: string;
  licenseId: string;
}

export async function sendReceiptEmail(payload: ReceiptPayload) {
  const { to, amount, currency, reference, licenseId } = payload;

  // TODO: Replace with real email provider (Nodemailer, Resend, etc.)
  console.log("Sending receipt email:", {
    to,
    subject: "Payment Receipt",
    body: `Thank you for your payment of ${currency} ${amount.toLocaleString()}.
Reference: ${reference}
License: ${licenseId}`,
  });

  // Example with a real provider would go here.
}

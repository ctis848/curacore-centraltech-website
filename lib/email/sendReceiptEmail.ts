import PDFDocument from "pdfkit";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

// Convert PDFKit document to Buffer (TypeScript-safe)
async function pdfToBuffer(doc: InstanceType<typeof PDFDocument>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

// ⭐ FIXED: licenseId is now OPTIONAL
interface ReceiptPayload {
  to: string;
  amount: number;
  currency: string;
  reference: string;
  licenseId?: string | null;   // ⭐ OPTIONAL NOW
  companyName?: string;
  plan?: string;
  quantity?: number | string;
  type?: string;
  isAdmin?: boolean;
}

export async function sendReceiptEmail({
  to,
  amount,
  currency,
  reference,
  licenseId = null,   // ⭐ DEFAULT VALUE
  companyName = "",
  plan = "",
  quantity = "",
  type = "",
  isAdmin = false,
}: ReceiptPayload) {
  // ----------------------------------------------------
  // 1. Generate PDF Invoice
  // ----------------------------------------------------
  const doc = new PDFDocument({ margin: 50 });

  doc.fontSize(22).text("CTIS Tech — Payment Receipt", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Reference: ${reference}`);
  doc.text(`Company: ${companyName}`);
  doc.text(`Plan: ${plan}`);
  doc.text(`Quantity: ${quantity}`);
  doc.text(`Payment Type: ${type}`);
  doc.text(`Amount Paid: ₦${amount.toLocaleString()}`);
  doc.text(`Currency: ${currency}`);

  // ⭐ FIXED: License ID is optional
  doc.text(`License ID: ${licenseId ?? "N/A"}`);

  doc.moveDown();
  doc.text("Thank you for choosing CentralCore EMR.", { align: "center" });

  const pdfBuffer = await pdfToBuffer(doc);

  // ----------------------------------------------------
  // 2. Build Beautiful HTML Template
  // ----------------------------------------------------
  const title = isAdmin
    ? "New Payment Received"
    : "Your CentralCore Payment Receipt";

  const intro = isAdmin
    ? `<p>A new payment has been received on your CTIS platform.</p>`
    : `<p>Thank you for your payment! Your transaction has been confirmed.</p>`;

  const html = `
    <div style="font-family: Arial, sans-serif; background: #f5f7fa; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        
        <div style="text-align: center;">
          <img src="https://ctistech.com/logo.png" alt="CTIS Logo" style="width: 120px; margin-bottom: 20px;" />
          <h1 style="color: #0d9488; font-size: 28px; margin-bottom: 10px;">${title}</h1>
        </div>

        ${intro}

        <div style="margin-top: 20px; padding: 20px; background: #f0fdfa; border-left: 5px solid #0d9488; border-radius: 8px;">
          <p><strong>Company:</strong> ${companyName}</p>
          <p><strong>Plan:</strong> ${plan}</p>
          <p><strong>Quantity:</strong> ${quantity}</p>
          <p><strong>Payment Type:</strong> ${type}</p>
          <p><strong>Amount Paid:</strong> ₦${amount.toLocaleString()}</p>
          <p><strong>Reference:</strong> ${reference}</p>
        </div>

        <p style="margin-top: 20px;">
          A PDF receipt has been attached to this email for your records.
        </p>

        <p style="margin-top: 30px; text-align: center; color: #64748b;">
          © ${new Date().getFullYear()} CTIS Tech — CentralCore EMR
        </p>
      </div>
    </div>
  `;

  // ----------------------------------------------------
  // 3. Send Email with PDF Attachment
  // ----------------------------------------------------
  await resend.emails.send({
    from: "CTIS Tech <no-reply@ctistech.com>",
    to,
    subject: title,
    html,
    attachments: [
      {
        filename: `CTIS-Receipt-${reference}.pdf`,
        content: pdfBuffer.toString("base64"),
        contentType: "application/pdf",
      },
    ],
  });
}

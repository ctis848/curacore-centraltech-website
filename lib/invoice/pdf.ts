import PDFDocument from "pdfkit";

type InvoiceData = {
  company: string;
  email: string;
  plan: string;
  quantity: number;
  amount: number;
  reference: string;
  date?: string;
};

export async function generateInvoicePdfBuffer(
  data: InvoiceData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const dateStr =
      data.date || new Date().toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" });

    // Header
    doc
      .fontSize(20)
      .fillColor("#0f766e")
      .text("CentralCore EMR", { align: "left" })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor("#555")
      .text("Central Tech Information System Ltd", { align: "left" })
      .text("Lagos, Nigeria")
      .moveDown(1.5);

    // Invoice meta
    doc
      .fontSize(14)
      .fillColor("#000")
      .text("INVOICE", { align: "right" })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .text(`Date: ${dateStr}`, { align: "right" })
      .text(`Reference: ${data.reference}`, { align: "right" })
      .moveDown(1.5);

    // Bill to
    doc
      .fontSize(12)
      .fillColor("#000")
      .text("Bill To:", { underline: true })
      .moveDown(0.3);

    doc
      .fontSize(10)
      .fillColor("#333")
      .text(data.company)
      .text(data.email)
      .moveDown(1.5);

    // Table header
    doc
      .fontSize(11)
      .fillColor("#000")
      .text("Description", 50, doc.y, { continued: true })
      .text("Qty", 300, doc.y, { continued: true })
      .text("Unit Price", 350, doc.y, { continued: true })
      .text("Total", 450, doc.y);

    doc
      .moveTo(50, doc.y + 3)
      .lineTo(550, doc.y + 3)
      .strokeColor("#ccc")
      .stroke()
      .moveDown(0.5);

    // Line item
    const unitPrice = data.amount / data.quantity;

    doc
      .fontSize(10)
      .fillColor("#333")
      .text(`CentralCore EMR License (${data.plan})`, 50, doc.y, {
        continued: true,
      })
      .text(String(data.quantity), 300, doc.y, { continued: true })
      .text(`₦${unitPrice.toLocaleString()}`, 350, doc.y, { continued: true })
      .text(`₦${data.amount.toLocaleString()}`, 450, doc.y);

    doc.moveDown(2);

    // Summary
    doc
      .fontSize(11)
      .fillColor("#000")
      .text("Subtotal:", 400, doc.y, { continued: true })
      .text(`₦${data.amount.toLocaleString()}`, 480, doc.y);

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .fillColor("#000")
      .text("Total:", 400, doc.y, { continued: true })
      .text(`₦${data.amount.toLocaleString()}`, 480, doc.y);

    doc.moveDown(2);

    doc
      .fontSize(9)
      .fillColor("#555")
      .text(
        "Thank you for choosing CentralCore EMR. For support, contact info@ctistech.com.",
        { align: "center" }
      );

    doc.end();
  });
}

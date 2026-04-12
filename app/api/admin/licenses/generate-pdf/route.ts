import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export async function POST(req: Request) {
  const { productName, licenseKey, clientEmail, maxActivations, expiresAt } =
    await req.json();

  const doc = new PDFDocument();
  const chunks: any[] = [];

  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => {});

  doc.fontSize(22).text("Software License Certificate", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Client: ${clientEmail}`);
  doc.text(`Product: ${productName}`);
  doc.text(`License Key: ${licenseKey}`);
  doc.text(`Max Activations: ${maxActivations || "Unlimited"}`);
  doc.text(`Expires At: ${expiresAt || "No Expiry"}`);

  doc.end();

  const pdfBuffer = Buffer.concat(chunks);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=license.pdf",
    },
  });
}

import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return new NextResponse('Missing invoice id', { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();

  if (!invoice) {
    return new NextResponse('Invoice not found', { status: 404 });
  }

  // Branded PDF
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  doc.on('end', () => {});

  // Header
  doc
    .fillColor('#0f766e')
    .fontSize(28)
    .text('CENTRALCORE EMR', { align: 'center' })
    .moveDown(0.5);

  doc
    .fillColor('#0f766e')
    .fontSize(16)
    .text('Official Payment Invoice', { align: 'center' })
    .moveDown(1.5);

  // Invoice Box
  doc
    .rect(50, 140, 500, 120)
    .strokeColor('#0f766e')
    .lineWidth(2)
    .stroke();

  doc
    .fontSize(14)
    .fillColor('#000')
    .text(`Invoice ID: ${invoice.id}`, 70, 160)
    .text(`Email: ${invoice.email}`, 70, 185)
    .text(`Plan: ${invoice.plan}`, 70, 210)
    .text(`Quantity: ${invoice.quantity}`, 70, 235);

  // Amount Box
  doc
    .rect(50, 280, 500, 100)
    .strokeColor('#0f766e')
    .lineWidth(2)
    .stroke();

  doc
    .fontSize(16)
    .fillColor('#0f766e')
    .text('Payment Summary', 70, 295);

  doc
    .fontSize(14)
    .fillColor('#000')
    .text(`Amount: ₦${invoice.amount.toLocaleString()} ${invoice.currency}`, 70, 325)
    .text(`Status: ${invoice.status}`, 70, 350);

  // Footer
  doc
    .fontSize(12)
    .fillColor('#666')
    .text(
      'Thank you for choosing CentralCore EMR — powering modern healthcare.',
      50,
      750,
      { align: 'center' }
    );

  doc.end();

  const pdfBuffer = Buffer.concat(chunks);

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${invoice.id}.pdf`,
    },
  });
}

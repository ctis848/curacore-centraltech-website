import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ licenseKey: string }> }
) {
  try {
    const { licenseKey } = await context.params;

    const cookieHeader = req.headers.get("cookie") || "";
    const accessToken = parseAccessTokenFromCookie(cookieHeader);

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: client, error: clientError } = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("auth_id", user.id)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const { data: licenseRecord, error: licenseError } = await supabaseAdmin
      .from("client_licenses")
      .select(
        `
        id,
        license_key,
        status,
        expires_at,
        licenses (
          product_name
        )
      `
      )
      .eq("license_key", licenseKey)
      .eq("client_id", client.id)
      .single();

    if (licenseError || !licenseRecord) {
      return NextResponse.json({ error: "License not found" }, { status: 404 });
    }

    const pdfBytes = await buildCertificatePdf({
      clientName: client.name || client.company_name || "Valued Client",
      productName:
        licenseRecord.licenses?.[0]?.product_name || "Licensed Product",
      licenseKey: licenseRecord.license_key,
      status: licenseRecord.status,
      expiresAt: licenseRecord.expires_at,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${licenseKey}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Certificate generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}

function parseAccessTokenFromCookie(cookieHeader: string): string | null {
  const match = cookieHeader.match(/sb-access-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function buildCertificatePdf(args: {
  clientName: string;
  productName: string;
  licenseKey: string;
  status: string;
  expiresAt: string | null;
}): Promise<Uint8Array> {
  const { clientName, productName, licenseKey, status, expiresAt } = args;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.98, 0.98, 0.98),
  });

  page.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: rgb(0.2, 0.4, 0.6),
    borderWidth: 2,
  });

  const title = "Certificate of License";
  const titleSize = 28;
  const titleWidth = fontBold.widthOfTextAtSize(title, titleSize);
  page.drawText(title, {
    x: (width - titleWidth) / 2,
    y: height - 120,
    size: titleSize,
    font: fontBold,
    color: rgb(0.1, 0.2, 0.4),
  });

  const subtitle = "This certifies that";
  const subtitleSize = 14;
  const subtitleWidth = font.widthOfTextAtSize(subtitle, subtitleSize);
  page.drawText(subtitle, {
    x: (width - subtitleWidth) / 2,
    y: height - 160,
    size: subtitleSize,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });

  const clientSize = 22;
  const clientWidth = fontBold.widthOfTextAtSize(clientName, clientSize);
  page.drawText(clientName, {
    x: (width - clientWidth) / 2,
    y: height - 195,
    size: clientSize,
    font: fontBold,
    color: rgb(0.05, 0.25, 0.45),
  });

  const productLine = `holds an active license for:`;
  const productLineSize = 14;
  const productLineWidth = font.widthOfTextAtSize(productLine, productLineSize);
  page.drawText(productLine, {
    x: (width - productLineWidth) / 2,
    y: height - 230,
    size: productLineSize,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });

  const productSize = 18;
  const productWidth = fontBold.widthOfTextAtSize(productName, productSize);
  page.drawText(productName, {
    x: (width - productWidth) / 2,
    y: height - 260,
    size: productSize,
    font: fontBold,
    color: rgb(0.1, 0.3, 0.6),
  });

  const detailsY = height - 310;

  page.drawText(`License Key: ${licenseKey}`, {
    x: 80,
    y: detailsY,
    size: 12,
    font,
  });

  page.drawText(`Status: ${status}`, {
    x: 80,
    y: detailsY - 24,
    size: 12,
    font,
  });

  page.drawText(
    `Expires: ${
      expiresAt ? new Date(expiresAt).toLocaleDateString() : "No expiration"
    }`,
    {
      x: 80,
      y: detailsY - 48,
      size: 12,
      font,
    }
  );

  return pdfDoc.save();
}

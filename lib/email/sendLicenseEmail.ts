export async function sendLicenseEmail({
  to,
  subject,
  bodyText,
  txtFilename,
  txtContent,
}: {
  to: string;
  subject: string;
  bodyText: string;
  txtFilename: string;
  txtContent: string;
}) {
  try {
    // Replace with your real email provider
    const res = await fetch(process.env.EMAIL_SERVICE_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EMAIL_SERVICE_TOKEN}`,
      },
      body: JSON.stringify({
        to,
        subject,
        text: bodyText,
        attachments: [
          {
            filename: txtFilename,
            content: Buffer.from(txtContent).toString("base64"),
            encoding: "base64",
            contentType: "text/plain",
          },
        ],
      }),
    });

    if (!res.ok) {
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error("Email error:", err);
    return { success: false };
  }
}

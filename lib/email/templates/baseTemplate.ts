export function baseEmailTemplate({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return `
  <!DOCTYPE html>
  <html>
  <body style="margin:0; padding:0; background:#f5f6fa; font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6fa; padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">

            <tr>
              <td style="background:#0d6efd; padding:20px; text-align:center; color:#ffffff; font-size:22px; font-weight:bold;">
                CentralCore
              </td>
            </tr>

            <tr>
              <td style="padding:30px; color:#333; font-size:16px; line-height:1.6;">
                ${message}
              </td>
            </tr>

            <tr>
              <td style="background:#f0f0f0; padding:15px; text-align:center; font-size:12px; color:#777;">
                © ${new Date().getFullYear()} CentralCore. All rights reserved.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

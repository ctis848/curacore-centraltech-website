type ReminderType = "30days" | "7days" | "3days" | "1day" | "today" | "overdue";

const typeTextMap: Record<ReminderType, { subject: string; line: string }> = {
  "30days": {
    subject: "CentralCore EMR – Annual Subscription Renewal (30 Days Notice)",
    line: "will expire in 30 days",
  },
  "7days": {
    subject: "CentralCore EMR – Annual Subscription Renewal (7 Days Notice)",
    line: "will expire in 7 days",
  },
  "3days": {
    subject: "CentralCore EMR – Annual Subscription Renewal (3 Days Notice)",
    line: "will expire in 3 days",
  },
  "1day": {
    subject: "CentralCore EMR – Annual Subscription Renewal (1 Day Notice)",
    line: "will expire in 1 day",
  },
  today: {
    subject: "CentralCore EMR – Annual Subscription Renewal Due Today",
    line: "is due for renewal today",
  },
  overdue: {
    subject: "CentralCore EMR – Annual Subscription Overdue",
    line: "has passed its renewal date and is now overdue",
  },
};

export function getRenewalEmailHtml(params: {
  clientName: string;
  paymentLink: string;
  type: ReminderType;
  year?: string | number;
}) {
  const { clientName, paymentLink, type, year = new Date().getFullYear() } =
    params;
  const { subject, line } = typeTextMap[type];

  const html = `<!DOCTYPE html>
<html lang="en" style="margin:0; padding:0;">
  <head>
    <meta charset="UTF-8" />
    <title>${subject}</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: Arial, Helvetica, sans-serif;
      color: #333;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="background-color: #f4f6f8; padding: 40px 0;"
    >
      <tr>
        <td align="center">
          <table
            width="600"
            cellpadding="0"
            cellspacing="0"
            style="
              background: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            "
          >
            <tr>
              <td
                style="
                  background: linear-gradient(90deg, #0d9488, #0f766e);
                  padding: 30px;
                  text-align: center;
                  color: #ffffff;
                "
              >
                <h1 style="margin: 0; font-size: 26px; font-weight: bold;">
                  CentralCore EMR Software
                </h1>
                <p style="margin: 8px 0 0; font-size: 16px;">
                  Annual Subscription Renewal Notice
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 30px;">
                <p style="font-size: 16px;">
                  Dear <strong>${clientName}</strong>,
                </p>

                <p style="font-size: 16px; line-height: 1.6;">
                  This is an official reminder that your
                  <strong>CentralCore EMR Software annual subscription ${line}</strong>.
                  To avoid any interruption in your access to the CentralCore EMR platform,
                  patient records, reporting tools, and all associated clinical features,
                  kindly proceed with your renewal.
                </p>

                <p style="font-size: 16px; line-height: 1.6;">
                  Your continued access to the EMR system depends on completing
                  this renewal as soon as possible.
                </p>

                <h3 style="margin-top: 25px; color: #0f766e;">
                  ⭐ How to Renew Your Annual Subscription
                </h3>

                <ul style="font-size: 16px; line-height: 1.7; padding-left: 20px;">
                  <li>Visit our website: <a href="https://www.ctistech.com" style="color:#0d9488;">www.ctistech.com</a></li>
                  <li>Click on <strong>Login</strong></li>
                  <li>Enter your credentials:</li>
                  <ul>
                    <li><strong>Username:</strong> Your company’s official email</li>
                    <li><strong>Password:</strong> Password!10</li>
                  </ul>
                  <li>Scroll down to <strong>Renew Annual Payment</strong></li>
                  <li>Click <strong>Proceed to Payment</strong></li>
                  <li>Select <strong>Card</strong> or <strong>Bank Transfer</strong></li>
                  <li>Complete your payment to maintain uninterrupted access</li>
                </ul>

                <h3 style="margin-top: 25px; color: #0f766e;">
                  ⭐ Secure Payment Link
                </h3>

                <p style="font-size: 16px;">
                  Please use the link below to complete your renewal:
                </p>

                <p style="text-align: center; margin: 30px 0;">
                  <a
                    href="${paymentLink}"
                    style="
                      background: #0d9488;
                      color: #ffffff;
                      padding: 14px 28px;
                      font-size: 18px;
                      font-weight: bold;
                      text-decoration: none;
                      border-radius: 8px;
                      display: inline-block;
                    "
                  >
                    Renew Subscription
                  </a>
                </p>

                <p style="font-size: 16px; line-height: 1.6;">
                  If you have already renewed your subscription, kindly disregard
                  this notice.
                </p>

                <p style="font-size: 16px; line-height: 1.6;">
                  Thank you for your continued trust in CentralTech. We remain
                  committed to delivering reliable, innovative, and professional
                  healthcare IT solutions to support your operations.
                </p>

                <p style="margin-top: 30px; font-size: 16px;">
                  Warm regards,<br />
                  <strong>CentralTech Support Team</strong><br />
                  <a href="https://www.ctistech.com" style="color:#0d9488;">www.ctistech.com</a>
                </p>
              </td>
            </tr>

            <tr>
              <td
                style="
                  background: #f0fdfa;
                  padding: 15px;
                  text-align: center;
                  font-size: 13px;
                  color: #555;
                "
              >
                © ${year} CentralTech. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html };
}

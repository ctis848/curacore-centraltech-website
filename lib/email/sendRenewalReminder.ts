import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRenewalReminderEmail(c: any, email: string, daysLeft: number) {
  const subject = `Annual Subscription Renewal – Action Required | ${c.name}`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.7;">
      <h2 style="color:#4A4A4A; margin-bottom: 10px;">Annual Subscription Renewal Reminder</h2>

      <p>Dear <strong>${c.name}</strong>,</p>

      <p>Your EMR Software annual subscription will expire in 
      <strong style="color:#d9534f;">${daysLeft} days</strong>. To avoid any interruption to your EMR access, patient records, billing, and reporting tools, please complete your renewal as soon as possible.</p>

      <h3 style="margin-top: 25px;">Subscription Details</h3>
      <ul>
        <li><strong>Company:</strong> ${c.name}</li>
        <li><strong>Next Renewal Date:</strong> ${new Date(c.renewal_date).toLocaleDateString()}</li>
        <li><strong>Annual Fee:</strong> ₦${c.annual_price.toLocaleString()}</li>
      </ul>

      <h3 style="margin-top: 25px;">How to Log In & Renew</h3>
      <ol style="padding-left: 20px;">
        <li>Visit your Client Portal:  
          <a href="https://www.ctistech.com" style="color:#0275d8;">www.ctistech.com</a>
        </li>
        <li>Click on <strong>Client Login</strong></li>
        <li>Enter your login details:
          <br/>Email: <strong>${email}</strong>
          <br/>Password: <strong>${c.portal_password || "******"}</strong>
        </li>
        <li>After logging in, click <strong>Renew Annual Payment</strong></li>
      </ol>

      <p>If you have already renewed, kindly disregard this message.</p>

      <p style="margin-top: 30px;">
        Warm regards,<br/>
        <strong>CTIS Support Team</strong><br/>
        <a href="https://www.ctistech.com" style="color:#0275d8;">www.ctistech.com</a>
      </p>
    </div>
  `;

  // Retry logic
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await resend.emails.send({
        from: "CTIS Support <support@ctistech.com>",
        to: email,
        subject,
        html,
      });
      return true;
    } catch (err) {
      if (attempt === 3) throw err;
      await new Promise((res) => setTimeout(res, 2000)); // wait 2 seconds
    }
  }
}

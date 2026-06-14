export function renewalReminderTemplate(company: any, daysLeft: number) {
  return `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <h2 style="color:#4A4A4A;">Annual Subscription Renewal Reminder</h2>

    <p>Dear <strong>${company.name}</strong>,</p>

    <p>This is a friendly reminder that your <strong>EMR Software Annual Subscription</strong> will expire in 
    <strong style="color:#d9534f;">${daysLeft} days</strong>.</p>

    <p>To avoid any interruption in your access to the EMR platform, patient records, reporting tools, and all associated clinical features, please proceed with your renewal.</p>

    <h3 style="margin-top: 25px;">Your Subscription Details</h3>
    <ul>
      <li><strong>Company:</strong> ${company.name}</li>
      <li><strong>Next Renewal Date:</strong> ${new Date(company.renewal_date).toLocaleDateString()}</li>
      <li><strong>Annual Fee:</strong> ₦${company.annual_price.toLocaleString()}</li>
    </ul>

    <h3 style="margin-top: 25px;">How to Renew</h3>
    <ol>
      <li>Visit <a href="https://www.ctistech.com">www.ctistech.com</a></li>
      <li>Log in to your Client Portal</li>
      <li>Email: <strong>${company.contact_email}</strong></li>
      <li>Password: <strong>${company.portal_password || "******"}</strong></li>
      <li>Click <strong>Renew Annual Payment</strong></li>
    </ol>

    <p>If you have already renewed, kindly disregard this message.</p>

    <p>Thank you for choosing <strong>Central Tech Information System (CTIS)</strong>.  
    We remain committed to delivering reliable and innovative IT solutions.</p>

    <p style="margin-top: 30px;">
      Warm regards,<br/>
      <strong>CTIS Support Team</strong><br/>
      <a href="https://www.ctistech.com">www.ctistech.com</a>
    </p>
  </div>
  `;
}

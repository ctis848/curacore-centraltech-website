export function adminRenewalNotice(company: any, daysLeft: number) {
  return `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="color:#4A4A4A;">Client Renewal Reminder Sent</h2>

    <p>A renewal reminder email has been sent to:</p>

    <ul>
      <li><strong>Company:</strong> ${company.name}</li>
      <li><strong>Email:</strong> ${company.contact_email}</li>
      <li><strong>Days Left:</strong> ${daysLeft}</li>
      <li><strong>Renewal Date:</strong> ${new Date(company.renewal_date).toLocaleDateString()}</li>
      <li><strong>Annual Fee:</strong> ₦${company.annual_price.toLocaleString()}</li>
    </ul>

    <p>This is for your record and monitoring.</p>

    <p style="margin-top: 20px;">
      Regards,<br/>
      <strong>CTIS Automated System</strong>
    </p>
  </div>
  `;
}

export function welcomeEmailTemplate(name: string) {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; background: #f7f7f7;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px;">
      <h2 style="color: #0d9488;">Welcome to CentralTech, ${name}!</h2>
      <p>We're excited to have you onboard. Your client portal is now active and ready.</p>

      <p>You can now:</p>
      <ul>
        <li>Manage your licenses</li>
        <li>View and pay invoices</li>
        <li>Open support tickets</li>
        <li>Access your dashboard</li>
      </ul>

      <p style="margin-top: 20px;">If you need help, our support team is always here.</p>

      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        CentralTech © ${new Date().getFullYear()}
      </p>
    </div>
  </div>
  `;
}

export function passwordResetTemplate(resetLink: string) {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; background: #f7f7f7;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px;">
      <h2 style="color: #0d9488;">Reset Your Password</h2>
      <p>You requested to reset your password. Click the button below:</p>

      <a href="${resetLink}" 
         style="display: inline-block; margin-top: 20px; padding: 12px 20px; background: #0d9488; color: white; text-decoration: none; border-radius: 6px;">
        Reset Password
      </a>

      <p style="margin-top: 20px;">If you didn’t request this, you can safely ignore this email.</p>

      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        CentralTech Security Team
      </p>
    </div>
  </div>
  `;
}

export function paymentSuccessTemplate(invoiceId: string, amount: number) {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; background: #f7f7f7;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px;">
      <h2 style="color: #16a34a;">Payment Successful</h2>
      <p>Your payment has been received successfully.</p>

      <p><strong>Invoice ID:</strong> ${invoiceId}</p>
      <p><strong>Amount Paid:</strong> ₦${amount.toLocaleString()}</p>

      <p style="margin-top: 20px;">Thank you for choosing CentralTech.</p>

      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        CentralTech Billing Department
      </p>
    </div>
  </div>
  `;
}

export function supportTicketTemplate(subject: string, message: string) {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; background: #f7f7f7;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px;">
      <h2 style="color: #0d9488;">Support Ticket Received</h2>
      <p>Your support request has been received. Our team will respond shortly.</p>

      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p style="background: #f1f5f9; padding: 10px; border-radius: 6px;">${message}</p>

      <p style="margin-top: 20px;">We appreciate your patience.</p>

      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        CentralTech Support Team
      </p>
    </div>
  </div>
  `;
}

export function invoiceReminderTemplate(invoiceId: string, amount: number, dueDate: string) {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; background: #f7f7f7;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px;">
      <h2 style="color: #dc2626;">Invoice Reminder</h2>
      <p>This is a reminder that your invoice is still unpaid.</p>

      <p><strong>Invoice ID:</strong> ${invoiceId}</p>
      <p><strong>Amount Due:</strong> ₦${amount.toLocaleString()}</p>
      <p><strong>Due Date:</strong> ${dueDate}</p>

      <p style="margin-top: 20px;">Please make your payment at your earliest convenience.</p>

      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        CentralTech Billing Team
      </p>
    </div>
  </div>
  `;
}

// netlify/functions/send-quote-email.ts
import { Handler } from '@netlify/functions';
import nodemailer from 'nodemailer';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { name, email, phone, message, service } = data;

  if (!name || !email || !phone || !service) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  // Validate env vars at runtime
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT);
  const secure = process.env.EMAIL_SECURE === 'true';
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!host || !port || !user || !pass) {
    console.error('Missing email configuration in env vars');
    return { statusCode: 500, body: JSON.stringify({ error: 'Server email configuration missing' }) };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure, // true for 465 (SSL), false for 587 (STARTTLS)
    auth: { user, pass },
    tls: { rejectUnauthorized: false }, // Helps with self-signed certs in some providers
  });

  const mailOptions = {
    from: `"CuraCore Quote Request" <${user}>`,
    to: 'info@ctistech.com', // or your preferred receiving address
    replyTo: email, // customer can reply directly
    subject: `New Quote Request: ${service}`,
    text: `
Name: ${name}
Email: ${email}
Phone: ${phone}
Service: ${service}
Message:
${message || 'No additional message'}
    `,
    html: `
      <h2 style="color: #0d9488;">New Quote Request</h2>
      <p><strong>Service:</strong> ${service}</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${message || 'No additional message'}</p>
      <hr>
      <small>Sent from https://www.ctistech.com</small>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error: unknown) {
    // Type guard to safely access message/stack
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Email send failed:', err.message, err.stack || '');
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to send email',
        details: err.message || 'Unknown error',
      }),
    };
  }
};
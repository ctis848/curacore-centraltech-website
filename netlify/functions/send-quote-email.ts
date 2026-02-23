// netlify/functions/send-quote-email.ts
import { Handler } from '@netlify/functions';
import nodemailer from 'nodemailer';

export const handler: Handler = async (event) => {
  // ────────────────────────────────────────────────
  // EARLY DEBUG LOGS - these run immediately when the function is called
  console.log('Function send-quote-email was invoked at:', new Date().toISOString());
  console.log('HTTP method:', event.httpMethod);
  console.log('Raw body length:', event.body?.length || 0);

  // Previous logs (already in your code)
  console.log('Received body:', event.body);

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
    console.log('Parsed data:', data);
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { name, email, phone, message, service } = data;

  if (!name || !email || !phone || !service) {
    console.error('Missing fields:', { name, email, phone, service });
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  // Log env vars (no password)
  console.log('Email config:', {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE,
    user: process.env.EMAIL_USER,
    // pass not logged
  });

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
  });

  const mailOptions = {
    from: `"CuraCore Quote Request" <${process.env.EMAIL_USER}>`,
    to: 'info@ctistech.com',
    replyTo: email,
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
      <h2>New Quote Request</h2>
      <p><strong>Service:</strong> ${service}</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong></p>
      <p>${message || 'No additional message'}</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Email send failed:', err.message, err.stack || '');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send email', details: err.message }),
    };
  }
};
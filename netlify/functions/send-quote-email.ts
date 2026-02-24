import { Handler } from '@netlify/functions';
import nodemailer from 'nodemailer';

export const handler: Handler = async (event) => {
  console.log('Function invoked:', new Date().toISOString());
  console.log('Method:', event.httpMethod);
  console.log('Body:', event.body);

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
    console.log('Parsed data:', data);
  } catch (err) {
    console.error('Parse error:', err);
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { name, email, phone, message, service } = data;

  if (!name || !email || !phone || !service) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) };
  }

  console.log('SMTP config:', {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE,
    user: process.env.EMAIL_USER,
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
    from: `"Quote Request" <${process.env.EMAIL_USER}>`,
    to: 'info@ctistech.com',
    replyTo: email,
    subject: `New Quote Request: ${service}`,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\nMessage: ${message || 'None'}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Mail sent:', info.messageId);
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('SMTP error:', err);
    const details = err instanceof Error ? err.message : String(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send email', details }),
    };
  }
};
import { Handler } from '@netlify/functions';
import nodemailer from 'nodemailer';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON format' }),
    };
  }

  // Normalize fields from your form
  const name = data.fullName || data.name;
  const email = data.email;
  const phone = data.phone;
  const message = data.message || data.details || '';
  const service = data.service || 'CCTV Security Surveillance';

  if (!name || !email || !phone) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }

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
    text: `
Name: ${name}
Email: ${email}
Phone: ${phone}
Service: ${service}
Message: ${message || 'None'}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to send email',
        details: err instanceof Error ? err.message : String(err),
      }),
    };
  }
};

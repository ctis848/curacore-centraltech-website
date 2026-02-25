import { Handler } from '@netlify/functions';
import nodemailer from 'nodemailer';

interface SendMailInfo {
  messageId: string;
  // add other fields you might need later
}

export const handler: Handler = async (event) => {
  console.log('=== send-quote-email invoked at:', new Date().toISOString());
  console.log('Method:', event.httpMethod);
  console.log('Body length:', event.body?.length ?? 0);

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  let data: any;
  try {
    data = JSON.parse(event.body || '{}');
    console.log('Parsed data:', data);
  } catch (err) {
    console.error('JSON parse error:', err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { name, email, phone, message, service } = data;

  if (!name || !email || !phone || !service) {
    console.warn('Missing required fields');
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }

  console.log('SMTP config loaded:', {
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
    connectionTimeout: 8000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
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
Message:
${message || 'None'}
    `,
  };

  try {
    const info = (await transporter.sendMail(mailOptions)) as SendMailInfo;
    console.log('Email sent successfully → Message ID:', info.messageId);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err: unknown) {
    console.error('SMTP send error:', err);
    const details = err instanceof Error ? err.message : String(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to send email',
        details,
      }),
    };
  }
};
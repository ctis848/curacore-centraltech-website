import { Handler } from '@netlify/functions';
import nodemailer from 'nodemailer';

export const handler: Handler = async (event) => {
  const timeout = 9000; // 9 seconds - fail before Netlify 10s cut-off
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    console.log('Invoked at:', new Date().toISOString());

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    let data;
    try {
      data = JSON.parse(event.body || '{}');
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { name, email, phone, message, service } = data;
    if (!name || !email || !phone || !service) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: 8000, // 8 seconds max connect
      greetingTimeout: 5000,
      socketTimeout: 8000,
      tls: { rejectUnauthorized: false },
    });

    const mailOptions = {
      from: `"Quote Request" <${process.env.EMAIL_USER}>`,
      to: 'info@ctistech.com',
      replyTo: email,
      subject: `New Quote Request: ${service}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\nMessage: ${message || 'None'}`,
    };

    const info = await transporter.sendMail(mailOptions);
    clearTimeout(timeoutId);
    console.log('Sent:', info.messageId);
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    clearTimeout(timeoutId);
    const details = err instanceof Error ? err.message : String(err);
    console.error('Error:', details);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send', details }),
    };
  }
};
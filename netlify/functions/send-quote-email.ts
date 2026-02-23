// netlify/functions/send-quote-email.ts
import nodemailer from 'nodemailer';
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface QuoteRequestBody {
  name: string;
  email: string;
  phone: string;
  message?: string;
  service: string;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const httpMethod = event.httpMethod;

  // Common CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://www.ctistech.com',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  } as const;

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders };
  }

  if (httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { Allow: 'POST' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  let data: QuoteRequestBody;

  try {
    data = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { name, email, phone, message = '', service } = data;

  if (!name || !email || !phone || !service) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid email format' }),
    };
  }

  // GoDaddy SMTP settings
  const transporter = nodemailer.createTransport({
    host: 'smtpout.secureserver.net',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"CuraCore Quote Request" <info@ctistech.com>`,
    to: 'info@ctistech.com',
    replyTo: email,
    subject: `New Quote Request: ${service}`,
    text: `
Name: ${name}
Email: ${email}
Phone: ${phone}
Service: ${service}
Message:
${message || 'No additional message provided'}

Sent from: https://www.ctistech.com
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0d9488; margin-bottom: 20px;">New Quote Request</h2>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <h3 style="color: #333; margin-top: 20px;">Message:</h3>
        <p style="white-space: pre-wrap; background: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
          ${message || 'No additional message provided'}
        </p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 0.9em; text-align: center;">
          Sent from <a href="https://www.ctistech.com" style="color: #0d9488;">www.ctistech.com</a>
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: 'Quote request sent successfully! We will contact you soon.',
      }),
    };
  } catch (error: any) {
    console.error('Email sending failed:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Failed to send email',
        details: error.message || 'Unknown error',
      }),
    };
  }
};

export { handler };
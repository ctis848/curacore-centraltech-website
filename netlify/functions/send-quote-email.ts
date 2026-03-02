import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import nodemailer from 'nodemailer';

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // Parse body
  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { name, email, phone, service, message } = payload;

  // Required fields
  if (!name || !email || !phone || !service) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Missing required fields: name, email, phone, service',
      }),
    };
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid email format' }),
    };
  }

  try {
    // Office365 SMTP Transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false, // TLS
      auth: {
        user: process.env.MAIL_USER, // info@ctistech.com
        pass: process.env.MAIL_PASS, // your email password
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Email content
    const mailOptions = {
      from: `"CentralCore Quotes" <info@ctistech.com>`,
      to: "info@ctistech.com", // your receiving inbox
      replyTo: email, // customer reply goes to their email
      subject: `New Quote Request: ${service}`,
      text: `
New Quote Request

Name:     ${name.trim()}
Email:    ${email.trim()}
Phone:    ${phone.trim()}
Service:  ${service.trim()}

Message:
${(message || '(no message)').trim()}

Sent from ctistech.com
      `.trim(),
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err: unknown) {
    console.error("SMTP Error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to send quote request",
        details: msg,
      }),
    };
  }
};

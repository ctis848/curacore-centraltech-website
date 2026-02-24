// netlify/functions/send-quote-email.ts
import { Handler } from '@netlify/functions';
import nodemailer from 'nodemailer';

export const handler: Handler = async (event) => {
  // ────────────────────────────────────────────────
  // 1. Early logging – runs even if everything else crashes
  console.log('=== send-quote-email invoked ===');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', event.httpMethod);
  console.log('Body length:', event.body?.length ?? 0);

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    console.warn('Invalid method:', event.httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // ────────────────────────────────────────────────
  // 2. Parse incoming JSON body
  let payload: any;
  try {
    payload = JSON.parse(event.body || '{}');
    console.log('Payload received:', payload);
  } catch (err) {
    console.error('JSON parse error:', err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { name, email, phone, message, service } = payload;

  // Basic validation
  if (!name || !email || !phone || !service) {
    console.warn('Missing required fields', { name, email, phone, service });
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }

  // ────────────────────────────────────────────────
  // 3. Load & validate email configuration
  const config = {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  };

  if (!config.host || !config.port || !config.user || !config.pass) {
    console.error('Missing email configuration', {
      hasHost: !!config.host,
      hasPort: !!config.port,
      hasUser: !!config.user,
      hasPass: !!config.pass,
    });
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server email configuration missing' }),
    };
  }

  console.log('Email config loaded:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.user,
  });

  // ────────────────────────────────────────────────
  // 4. Create Nodemailer transport
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: false, // Helps with some self-signed certs
    },
  });

  // ────────────────────────────────────────────────
  // 5. Prepare email content
  const mailOptions = {
    from: `"Quote Request" <${config.user}>`,
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
      <h2 style="color: #0d9488;">New Quote Request</h2>
      <p><strong>Service:</strong> ${service}</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${message || 'No additional message'}</p>
      <hr>
      <small>Sent from https://ctistech.com</small>
    `,
  };

  // ────────────────────────────────────────────────
  // 6. Try to send
  try {
    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully → Message ID:', info.messageId);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Email sending failed:', {
      message: error.message,
      stack: error.stack || 'No stack',
      code: (error as any).code || 'unknown',
    });

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to send email',
        details: error.message || 'Unknown error',
      }),
    };
  }
};
// netlify/functions/send-quote-email.ts
import { Handler } from '@netlify/functions';

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

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'info@ctistech.com',           // Change to your verified sender if needed
        to: 'info@ctistech.com',
        reply_to: email,
        subject: `New Quote Request: ${service}`,
        text: `
Name: ${name}
Email: ${email}
Phone: ${phone}
Service: ${service}
Message:
${message || 'None'}
        `,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error('Resend API error:', errData);
      throw new Error(errData.message || `Resend returned ${response.status}`);
    }

    console.log('Email sent via Resend');
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err: unknown) {
    console.error('Send error:', err);
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
// netlify/functions/send-quote-email.ts
import { Handler } from '@netlify/functions';

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
      body: JSON.stringify({ error: 'Invalid JSON' }),
    };
  }

  const { name, email, phone, message, service } = data;

  // Basic validation
  if (!name || !email || !phone || !service) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields: name, email, phone, service' }),
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
        from: 'CentralCore Quotes <info@ctistech.com>',  // Verified domain + friendly name
        to: 'info@ctistech.com',                         // Your real inbox
        reply_to: email,                                 // Customer's email for replies
        subject: `New Quote Request: ${service}`,
        text: `
New Quote Request Received

Name:     ${name}
Email:    ${email}
Phone:    ${phone}
Service:  ${service}

Message:
${message || '(No additional message provided)'}

Sent from: ctistech.com
        `.trim(),
        // Optional: HTML version (uncomment if you want richer email)
        // html: `
        //   <h2 style="color: #0d9488;">New Quote Request: ${service}</h2>
        //   <p><strong>Name:</strong> ${name}</p>
        //   <p><strong>Email:</strong> ${email}</p>
        //   <p><strong>Phone:</strong> ${phone}</p>
        //   <p><strong>Service:</strong> ${service}</p>
        //   <h3>Message:</h3>
        //   <p>${message || '(No message)'}</p>
        //   <hr style="border-color: #e5e7eb;" />
        //   <p style="color: #6b7280; font-size: 0.875rem;">
        //     Sent from ctistech.com
        //   </p>
        // `,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error('Resend error:', errData);
      throw new Error(errData.message || `Resend returned ${response.status}`);
    }

    console.log(`Quote email sent successfully to info@ctistech.com`);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err: unknown) {
    console.error('Send email failed:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to send quote request',
        details: errorMessage,
      }),
    };
  }
};
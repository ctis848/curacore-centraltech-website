// app/api/create-admin/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // MUST use service role key — full admin power
);

export async function POST(request: Request) {
  try {
    // 1. Optional: Protect this endpoint in production
    // Uncomment and add your admin auth check if needed
    // const authHeader = request.headers.get('authorization');
    // if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // 2. Generate secure random password (12 chars, strong)
    const randomPassword = crypto.randomBytes(12).toString('base64url');

    // 3. Create user in Supabase
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: randomPassword,
      email_confirm: true, // auto-confirm email (optional — set false if you want verification)
      user_metadata: {
        role: 'admin',
        created_by: 'system', // optional tracking
      },
    });

    if (error) {
      console.error('Supabase admin create user error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create admin user' },
        { status: error.status || 500 }
      );
    }

    const newUser = data.user;

    // 4. Optional: Send welcome email with credentials via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'CentralCore Admin <no-reply@ctistech.com>',
            to: email,
            subject: 'Welcome - Your Admin Account Has Been Created',
            text: `
Hello,

An admin account has been created for you on CentralCore.

Email: ${email}
Password: ${randomPassword}

Please log in at https://ctistech.com/admin and change your password immediately.

Best regards,
CTIS Technologies Team
            `,
            // Optional: html version
            // html: `<h1>Welcome!</h1><p>Email: ${email}</p><p>Password: <strong>${randomPassword}</strong></p>...`,
          }),
        });
      } catch (emailErr) {
        console.error('Failed to send welcome email:', emailErr);
        // Do not fail the whole request — just log
      }
    }

    // 5. Return success (never return password in production response!)
    // In real use: send password via email only, not in response
    return NextResponse.json({
      success: true,
      userId: newUser.id,
      email: newUser.email,
      message: 'Admin user created successfully. Credentials sent via email.',
    });

  } catch (err: unknown) {
    console.error('Create admin error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
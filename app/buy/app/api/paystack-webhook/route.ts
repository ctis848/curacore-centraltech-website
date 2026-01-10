// app/api/paystack-webhook/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Use service role for admin actions
);

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!; // Add this to .env.local

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('x-paystack-signature');

  // Verify webhook signature
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(body).digest('hex');

  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(body);

  // Only handle successful payments
  if (event.event === 'charge.success') {
    const { email, metadata, amount, reference } = event.data;

    const plan = metadata.plan;
    const quantity = parseInt(metadata.quantity);

    // Calculate expected amount in kobo to prevent tampering
    let expectedAmount = 0;
    if (plan === 'Starter') expectedAmount = 110000 * quantity;
    if (plan === 'Pro') expectedAmount = 150000 * quantity;
    if (plan === 'Lifetime') expectedAmount = 39900000 * quantity;

    if (amount !== expectedAmount) {
      console.error('Amount mismatch', { amount, expectedAmount });
      return NextResponse.json({ status: 'ignored' });
    }

    // Create or update user in Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        plan,
        quantity,
        paystack_ref: reference,
        paid_at: new Date().toISOString(),
      },
    });

    if (authError && authError.message !== 'User already registered') {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Auth failed' });
    }

    // If user already exists, update metadata
    if (!user && authError?.message === 'User already registered') {
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const foundUser = existingUser.users.find(u => u.email === email);
      if (foundUser) {
        await supabase.auth.admin.updateUserById(foundUser.id, {
          user_metadata: {
            plan,
            quantity,
            paystack_ref: reference,
            paid_at: new Date().toISOString(),
          },
        });
      }
    }

    // Auto-generate strong password and send welcome email (optional)
    // You can use Resend or SendGrid for this

    console.log(`Payment verified and account ready for ${email} - Plan: ${plan}, Seats: ${quantity}`);
  }

  return NextResponse.json({ status: 'success' });
}

export const config = {
  api: {
    bodyParser: false, // Important for webhook raw body
  },
};
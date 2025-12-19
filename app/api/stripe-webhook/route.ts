// app/api/stripe-webhook/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature')!;
  const body = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_email || session.customer_details?.email;
    const plan = session.metadata?.plan || 'starter';
    const quantityStr = session.metadata?.quantity || '1';
    const quantity = parseInt(quantityStr, 10);

    if (email) {
      // Try to get existing user
      const { data: existingUserData, error: getError } = await supabase.auth.admin.listUsers();
      const existingUser = existingUserData?.users.find(u => u.email === email);

      if (existingUser) {
        // Update existing user metadata
        const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
          user_metadata: {
            plan: plan,
            quantity: quantity,
          },
        });

        if (updateError) {
          console.error('Error updating user metadata:', updateError);
        }
      } else {
        // Create new user
        const randomPassword = Math.random().toString(36).slice(-12);
        const { error: createError } = await supabase.auth.admin.createUser({
          email,
          password: randomPassword,
          email_confirm: true,
          user_metadata: {
            plan: plan,
            quantity: quantity,
          },
        });

        if (createError) {
          console.error('Error creating user:', createError);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
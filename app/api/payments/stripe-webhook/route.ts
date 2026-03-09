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

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const email = session.customer_email || session.customer_details?.email;
    const plan = session.metadata?.plan || 'starter';
    const quantity = parseInt(session.metadata?.quantity || '1', 10);
    const customerId = session.customer as string; // Stripe Customer ID

    if (!email || !customerId) {
      console.error('Missing email or customer ID in session');
      return NextResponse.json({ received: true });
    }

    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      return NextResponse.json({ received: true });
    }

    const existingUser = usersData.users.find((u: any) => u.email === email);

    const updatedMetadata = {
      plan,
      quantity,
      stripe_customer_id: customerId,
      role: existingUser?.user_metadata?.role || 'user',
    };

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
        user_metadata: updatedMetadata,
      });

      if (updateError) {
        console.error('Error updating user:', updateError);
      } else {
        console.log(`Updated user ${email} with plan ${plan}, quantity ${quantity}, customer ID ${customerId}`);
      }
    } else {
      // Create new user
      const randomPassword = Math.random().toString(36).slice(-12);
      const { error: createError } = await supabase.auth.admin.createUser({
        email,
        password: randomPassword,
        email_confirm: true,
        user_metadata: {
          ...updatedMetadata,
          role: 'user',
        },
      });

      if (createError) {
        console.error('Error creating user:', createError);
      } else {
        console.log(`Created new user ${email} with plan ${plan}, quantity ${quantity}, customer ID ${customerId}`);
        // Optional: Send welcome email with password here
      }
    }
  }

  return NextResponse.json({ received: true });
}
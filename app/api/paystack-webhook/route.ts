// app/api/paystack-webhook/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const rawBody = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_email || session.customer_details?.email;
    const plan = session.metadata?.plan || 'starter';
    const quantity = parseInt(session.metadata?.quantity || '1', 10);
    const customerId = session.customer as string;

    if (email) {
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const existingUser = usersData.users.find((u: any) => u.email === email);

      const updatedMetadata = {
        plan,
        quantity,
        stripe_customer_id: customerId,
        role: existingUser?.user_metadata?.role || 'user',
      };

      if (existingUser) {
        await supabase.auth.admin.updateUserById(existingUser.id, {
          user_metadata: updatedMetadata,
        });
      } else {
        const randomPassword = Math.random().toString(36).slice(-12);
        await supabase.auth.admin.createUser({
          email,
          password: randomPassword,
          email_confirm: true,
          user_metadata: updatedMetadata,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
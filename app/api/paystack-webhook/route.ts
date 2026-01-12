// app/api/paystack-webhook/route.ts
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
  const rawBody = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret) as Stripe.Event;
  } catch (err: unknown) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_email || session.customer_details?.email;
      const plan = session.metadata?.plan || 'starter';
      const quantity = parseInt(session.metadata?.quantity || '1', 10);
      const customerId = session.customer as string; // already string in most cases

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
      break;
    }

    case 'invoice.payment_failed':
    case 'customer.subscription.deleted': {
      const obj = event.data.object as Stripe.Invoice | Stripe.Subscription;

      // Safely extract customer ID (can be string, Customer object, or DeletedCustomer)
      let customerId: string | null = null;

      if (typeof obj.customer === 'string') {
        customerId = obj.customer;
      } else if (obj.customer && 'id' in obj.customer) {
        customerId = obj.customer.id;
      }

      if (!customerId) {
        console.error('No valid customer ID found in event');
        break;
      }

      const { data: profile, error: fetchError } = await supabase
        .from('profiles') // Change to your actual table name if different
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (fetchError || !profile) {
        console.error('Failed to find user profile:', fetchError);
        break;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          license_status: 'expired',
          active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (updateError) {
        console.error('Failed to expire license:', updateError);
      }
      break;
    }

    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
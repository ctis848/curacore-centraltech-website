// app/api/create-portal-session/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const returnUrl = process.env.NEXT_PUBLIC_URL + '/portal/dashboard';

  // In production: Get authenticated user from Supabase session
  // For now, assume you pass customerId via query or store in metadata
  // Example: const { data: { user } } = await supabase.auth.getUser();

  const customerId = 'cus_example'; // Replace with real retrieval from user metadata

  if (!customerId) {
    return NextResponse.redirect(new URL('/portal/dashboard?error=no_billing', request.url));
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return NextResponse.redirect(session.url);
}
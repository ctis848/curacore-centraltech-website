// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { priceId } = await request.json();

  const session = await stripe.checkout.sessions.create({
    line_items: [{ price: priceId, quantity: 1 }],
    mode: priceId === 'price_1SaNJmECEzFismm5fDBhO46P' ? 'payment' : 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_URL}/portal/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/buy?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}
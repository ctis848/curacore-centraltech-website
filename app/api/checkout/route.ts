// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function POST(req: Request) {
  const { priceId } = await req.json();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: 'https://curacore-centraltech-website.netlify.app/portal/dashboard',
    cancel_url: 'https://curacore-centraltech-website.netlify.app/curacore',
  });

  return NextResponse.json({ id: session.id });
}
// app/api/create-paystack-checkout/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { plan, quantity = 1, amount, currency = 'NGN', productName } = body;

    console.log('Paystack checkout request:', { plan, quantity, amount, currency, productName });

    // Replace with your real Paystack secret key and logic
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecret) {
      throw new Error('Paystack secret key not configured');
    }

    // Real Paystack initialization (use paystack-node or fetch)
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'customer@example.com', // You need to collect real email from user
        amount: amount * 100, // Paystack uses kobo (smallest unit)
        currency,
        reference: `centralcore_${Date.now()}`,
        callback_url: `${process.env.NEXT_PUBLIC_URL}/success`,
        metadata: {
          plan,
          quantity,
          productName,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Paystack initialization failed');
    }

    return NextResponse.json({ authorization_url: data.data.authorization_url });
  } catch (error) {
    console.error('Paystack checkout error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
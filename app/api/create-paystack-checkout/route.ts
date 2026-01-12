// app/api/create-paystack-checkout/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      plan,
      quantity = 1,
      amount,
      currency = 'NGN',
      productName,
      email,              // ← Required: real customer email
      billingPeriod = 'monthly', // 'monthly' or 'yearly'
    } = body;

    if (!email) {
      return NextResponse.json({ error: 'Customer email is required' }, { status: 400 });
    }

    console.log('Paystack checkout request:', {
      plan,
      quantity,
      amount,
      currency,
      productName,
      email,
      billingPeriod,
    });

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecret) {
      throw new Error('Paystack secret key not configured');
    }

    // Prepare Paystack payload
    const payload: any = {
      email,
      amount: Math.round(amount * 100), // Paystack uses smallest unit (kobo for NGN)
      currency,
      reference: `centralcore_${Date.now()}`,
      callback_url: `${process.env.NEXT_PUBLIC_URL}/success?plan=${plan}&quantity=${quantity}`,
      metadata: {
        plan,
        quantity,
        productName,
        billingPeriod,
      },
    };

    // For yearly billing → make it a recurring subscription (every 12 months)
    if (billingPeriod === 'yearly') {
      payload.interval = 'yearly'; // Paystack supports 'yearly' for subscriptions
      // Optional: set plan code if you created a Paystack Plan for yearly
      // payload.plan = 'your_yearly_plan_code';
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Paystack initialization failed');
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (error) {
    console.error('Paystack checkout error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
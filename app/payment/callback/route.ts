import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference = url.searchParams.get('reference');

  if (!reference) {
    return NextResponse.redirect('/buy?error=missing_reference');
  }

  const verifyRes = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  const verifyData = await verifyRes.json();

  if (!verifyData.status || verifyData.data.status !== 'success') {
    return NextResponse.redirect('/buy?error=verification_failed');
  }

  const metadata = verifyData.data.metadata;
  const email = verifyData.data.customer.email as string;
  const invoiceId = metadata.invoice_id as number;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Mark invoice as paid
  await supabase
    .from('invoices')
    .update({
      status: 'paid',
      reference,
      paid_at: new Date().toISOString(),
    })
    .eq('id', invoiceId);

  // Update or create subscription
  await supabase
    .from('subscriptions')
    .upsert(
      {
        email,
        plan: metadata.plan,
        quantity: metadata.quantity,
        billing_period: metadata.billingPeriod,
        status: 'active',
      },
      { onConflict: 'email,plan' }
    );

  // Increment total licenses on user record
  await supabase.rpc('increment_user_licenses', {
    user_email: email,
    qty: metadata.quantity,
  });

  // (Optional) send receipt email via API route
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-receipt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      amount: verifyData.data.amount / 100,
      currency: verifyData.data.currency,
      plan: metadata.plan,
      quantity: metadata.quantity,
      reference,
    }),
  });

  return NextResponse.redirect('/dashboard?success=payment_complete');
}

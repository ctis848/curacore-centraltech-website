// app/api/payments/renew-service/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { reference, userId } = await request.json();

  // Optional: verify Paystack transaction here
  // https://paystack.com/docs/api/transaction/verify

  // Extend expiry by 1 year
  const newExpiry = new Date();
  newExpiry.setFullYear(newExpiry.getFullYear() + 1);

  const { error } = await supabase
    .from('enterprise_licenses')
    .update({
      service_expiry: newExpiry.toISOString(),
      active: true,
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Renewal update failed:', error);
    return NextResponse.json({ error: 'Failed to renew' }, { status: 500 });
  }

  // Send email via Resend (optional)
  // ...

  return NextResponse.json({ success: true });
}
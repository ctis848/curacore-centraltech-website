import { createClient } from '@supabase/supabase-js';

// TEMPORARY PAYMENT HANDLER
async function chargeCustomer(userId: string, plan: string) {
  // Replace with Paystack / Flutterwave / Stripe
  return true;
}

export const handler = async () => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = new Date().toISOString();

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('auto_renew', true)
    .eq('status', 'active')
    .lte('expires_at', today);

  for (const sub of subs || []) {
    const paymentOk = await chargeCustomer(sub.user_id, sub.plan);

    if (paymentOk) {
      const newExpiry = new Date(sub.expires_at);
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);

      await supabase
        .from('subscriptions')
        .update({ expires_at: newExpiry.toISOString() })
        .eq('id', sub.id);
    } else {
      await supabase
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('id', sub.id);
    }
  }

  return new Response("Renewal job completed");
};

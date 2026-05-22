import { supabaseServer } from "@/lib/supabase/server";

export async function logPaymentEvent(paymentId: string, eventType: string, message: string) {
  const supabase = supabaseServer();

  await supabase.from("payment_timeline").insert({
    payment_id: paymentId,
    event_type: eventType,
    message,
  });
}

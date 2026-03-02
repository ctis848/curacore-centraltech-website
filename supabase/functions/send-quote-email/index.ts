// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { full_name, email, phone, message, service } = body;

    // Initialize Supabase client (service role key is injected automatically)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Save to database
    const { error: dbError } = await supabase
      .from("quote_requests")
      .insert([
        {
          full_name,
          email,
          phone,
          service,
          message,
        },
      ]);

    if (dbError) {
      console.error("DB Error:", dbError);
      throw new Error("Failed to save quote request.");
    }

    // 2. Send email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CentralCore EMR <info@ctistech.com>",   // FIXED SENDER
        to: ["info@ctistech.com"],
        subject: `New Quote Request - ${service}`,
        html: `
          <h2>New Quote Request</h2>
          <p><strong>Name:</strong> ${full_name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Message:</strong><br>${message}</p>
        `,
      }),
    });

    const emailResult = await resendResponse.json();

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Quote request saved and email sent.",
        emailResult,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error("Function Error:", error);

    return new Response(
      JSON.stringify({
        status: "error",
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

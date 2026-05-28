export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getRenewalSms } from "@/lib/notifications/smsTemplates";

export async function POST(req: Request) {
  try {
    const { phone, type, paymentLink, provider } = await req.json();

    if (!phone || !type || !paymentLink) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const message = getRenewalSms(type, paymentLink);

    // ⭐ Termii SMS
    if (provider === "termii") {
      const response = await fetch("https://api.ng.termii.com/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: process.env.TERMII_API_KEY,
          to: phone,
          from: "CTIS",
          sms: message,
          type: "plain",
          channel: "generic",
        }),
      });

      const result = await response.json();
      return NextResponse.json({ success: true, result });
    }

    // ⭐ Twilio SMS
    if (provider === "twilio") {
      const twilioSID = process.env.TWILIO_SID;
      const twilioToken = process.env.TWILIO_TOKEN;
      const twilioFrom = process.env.TWILIO_FROM;

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSID}/Messages.json`;

      const response = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          Authorization:
            "Basic " + Buffer.from(`${twilioSID}:${twilioToken}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: phone,
          From: twilioFrom!,
          Body: message,
        }),
      });

      const result = await response.json();
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json(
      { success: false, error: "Invalid provider" },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function sendWhatsApp({
  to,
  message,
}: {
  to: string;
  message: string;
}) {
  try {
    // ⭐ Validate required fields
    if (!to || !message) {
      console.warn("WhatsApp not sent — missing 'to' or 'message'");
      return;
    }

    // ⭐ Validate environment variables
    if (
      !process.env.WHATSAPP_TOKEN ||
      !process.env.WHATSAPP_PHONE_ID
    ) {
      console.warn("WhatsApp not sent — missing WhatsApp API credentials");
      return;
    }

    // ⭐ Build WhatsApp payload
    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        body: message,
      },
    };

    // ⭐ Send request to WhatsApp Cloud API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    // ⭐ Handle WhatsApp API errors
    if (!response.ok) {
      console.error("WhatsApp API Error:", result);
      return;
    }

    console.log("WhatsApp alert sent successfully:", result);
  } catch (error) {
    console.error("WhatsApp sending failed:", error);
  }
}

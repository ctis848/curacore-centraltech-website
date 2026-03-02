require("dotenv").config({ path: ".env.local" });
const crypto = require("crypto");
const fetch = require("node-fetch");

// Debug check
if (!process.env.PAYSTACK_SECRET_KEY) {
  console.error("❌ PAYSTACK_SECRET_KEY is missing in .env.local");
  process.exit(1);
}

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// Fake event payload
const payload = {
  event: "charge.success",
  data: {
    reference: "TEST_REF_" + Date.now(),
    amount: 500000, // ₦5000
    customer: { email: "customer@example.com" },
    metadata: {
      plan: "pro",
      user_id: "test-user-123",
    },
  },
};

const rawBody = JSON.stringify(payload);

// Generate Paystack signature
const signature = crypto
  .createHmac("sha512", PAYSTACK_SECRET)
  .update(rawBody)
  .digest("hex");

async function triggerWebhook() {
  try {
    const res = await fetch("http://localhost:3000/api/paystack/webhook", {
      method: "POST",
      headers: {
        "x-paystack-signature": signature,
        "Content-Type": "application/json",
      },
      body: rawBody,
    });

    const data = await res.json();
    console.log("Webhook Response:", data);
  } catch (err) {
    console.error("❌ Error triggering webhook:", err);
  }
}

triggerWebhook();

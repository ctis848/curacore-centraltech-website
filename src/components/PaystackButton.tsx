"use client";

interface PaystackButtonProps {
  email: string;
  plan: string;
  amount: number;
  quantity: number;
}

export default function PaystackButton({ email, plan, amount, quantity }: PaystackButtonProps) {
  const handlePay = () => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;

    script.onload = () => {
      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email,
        amount: amount * 100 * quantity,
        metadata: { plan, quantity },
        callback: (response: { reference: string }) => {
          window.location.href = `/buy/success?ref=${response.reference}`;
        },
        onClose: () => alert("Payment cancelled."),
      });

      handler.openIframe();
    };

    document.body.appendChild(script);
  };

  return (
    <button
      onClick={handlePay}
      className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold"
    >
      Buy Now
    </button>
  );
}

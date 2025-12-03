// app/buy/page.tsx
import Navbar from '@/components/Navbar';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51SS3cfCu1JaX6ZMs6xuKVZFlujNtxZQlWmk8vVSo7QXyrl8zUz3EGP5GjQOFsfza6ZpKmWzl524YGqYkklvm2Nwi003STcuN6P'); // ← we replace this in 2 mins

export default function BuyLicense() {
  const handleCheckout = async (priceId: string) => {
    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      successUrl: 'https://curacore-centraltech-website.netlify.app/portal/dashboard',
      cancelUrl: 'https://curacore-centraltech-website.netlify.app/curacore',
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-10">Choose Your CuraCore Plan</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {/* Starter */}
            <div className="bg-white p-10 rounded-2xl shadow-xl">
              <h2 className="text-3xl font-bold text-blue-900">Starter</h2>
              <p className="text-6xl font-bold my-6">$11<span className="text-xl">/month</span></p>
              <p className="text-gray-600 mb-8">Up to 5 users</p>
              <button onClick={() => handleCheckout('price_1QStarterID')} className="w-full bg-blue-900 text-white py-4 rounded-lg text-xl font-bold hover:bg-blue-800">
                Buy Now
              </button>
            </div>

            {/* Pro - Most Popular */}
            <div className="bg-blue-900 text-white p-10 rounded-2xl shadow-2xl transform scale-105">
              <div className="bg-yellow-400 text-blue-900 inline-block px-4 py-1 rounded-full text-sm font-bold mb-4">MOST POPULAR</div>
              <h2 className="text-3xl font-bold">Pro</h2>
              <p className="text-6xl font-bold my-6">$15<span className="text-xl">/month</span></p>
              <p className="mb-8">Up to 25 users</p>
              <button onClick={() => handleCheckout('price_1QProID')} className="w-full bg-white text-blue-900 py-4 rounded-lg text-xl font-bold hover:bg-gray-100">
                Buy Now
              </button>
            </div>

            {/* Lifetime */}
            <div className="bg-white p-10 rounded-2xl shadow-xl">
              <h2 className="text-3xl font-bold text-blue-900">Lifetime</h2>
              <p className="text-6xl font-bold my-6">$399<span className="text-sm"> one-time</span></p>
              <p className="text-gray-600 mb-8">Unlimited users forever</p>
              <button onClick={() => handleCheckout('price_1QLifetimeID')} className="w-full bg-green-600 text-white py-4 rounded-lg text-xl font-bold hover:bg-green-700">
                Buy Lifetime
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
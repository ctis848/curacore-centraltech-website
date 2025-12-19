// app/support/page.tsx
import Link from 'next/link';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-24 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-12">
        <h1 className="text-5xl font-black text-blue-900 mb-8 text-center">
          CuraCore Support Center
        </h1>

        <div className="text-center mb-12">
          <p className="text-2xl text-gray-700 mb-8">
            We're here to help you get the most out of CuraCore EMR
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="bg-blue-50 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              Email Support
            </h2>
            <p className="text-xl mb-6">
              Get help from our expert team
            </p>
            <a
              href="mailto:support@curacore.com"
              className="inline-block bg-blue-900 text-white px-10 py-4 rounded-xl text-xl font-bold hover:bg-blue-800"
            >
              Email Us
            </a>
          </div>

          <div className="bg-green-50 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-green-900 mb-4">
              Phone Support
            </h2>
            <p className="text-xl mb-6">
              Speak directly with a specialist
            </p>
            <p className="text-3xl font-bold text-green-900">
              +234 803 123 4567
            </p>
            <p className="text-gray-600 mt-2">
              Monday - Friday, 8AM - 6PM WAT
            </p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">
            Documentation & Resources
          </h2>
          <div className="flex justify-center gap-8">
            <a
              href="/docs"
              className="bg-gray-600 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-gray-700"
            >
              User Guide
            </a>
            <a
              href="/faq"
              className="bg-gray-600 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-gray-700"
            >
              FAQ
            </a>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/portal/dashboard"
            className="inline-block bg-blue-900 text-white px-10 py-4 rounded-xl text-xl font-bold hover:bg-blue-800"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
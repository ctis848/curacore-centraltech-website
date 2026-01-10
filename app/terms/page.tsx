// app/terms/page.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function TermsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-screen w-full">
        <Image
          src="/terms-hero.jpg"
          alt="Legal agreement and contract document"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-teal-900/70" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-6">
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl">
            Terms of Service
          </h1>
          <p className="text-2xl md:text-3xl font-light max-w-4xl drop-shadow-lg">
            Last updated: December 22, 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 px-6 bg-teal-50">
        <div className="max-w-4xl mx-auto prose prose-lg text-gray-700">
          <h2 className="text-4xl font-black text-teal-900 mb-8">1. Acceptance of Terms</h2>
          <p>By accessing or using CentralCore EMR ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Service.</p>

          <h2 className="text-4xl font-black text-teal-900 mb-8 mt-16">2. Description of Service</h2>
          <p>CentralCore EMR is a cloud-based Electronic Medical Record (EMR) system provided by Central Tech Information Systems Ltd. for healthcare providers.</p>

          <h2 className="text-4xl font-black text-teal-900 mb-8 mt-16">3. User Accounts & Licenses</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials. Licenses are non-transferable and limited to the purchased quantity of users/computers.</p>

          <h2 className="text-4xl font-black text-teal-900 mb-8 mt-16">4. Payment & Subscription</h2>
          <p>Fees are charged monthly or one-time (Lifetime). Failure to pay may result in suspension of access.</p>

          <h2 className="text-4xl font-black text-teal-900 mb-8 mt-16">5. Data Ownership & Privacy</h2>
          <p>You own your patient data. We act as a data processor and comply with applicable privacy laws.</p>

          <h2 className="text-4xl font-black text-teal-900 mb-8 mt-16">6. Prohibited Use</h2>
          <p>You may not use the Service for unlawful purposes, reverse engineer the software, or exceed licensed usage.</p>

          <h2 className="text-4xl font-black text-teal-900 mb-8 mt-16">7. Termination</h2>
          <p>We may terminate or suspend access for violation of these terms.</p>

          <h2 className="text-4xl font-black text-teal-900 mb-8 mt-16">8. Limitation of Liability</h2>
          <p>The Service is provided "as is". We are not liable for data loss or indirect damages.</p>

          <h2 className="text-4xl font-black text-teal-900 mb-8 mt-16">9. Governing Law</h2>
          <p>These terms are governed by the laws of Nigeria.</p>

          <p className="mt-16 text-center">
            <Link href="/contact" className="text-teal-700 font-bold hover:underline">
              Contact us
            </Link> if you have questions about these terms.
          </p>
        </div>
      </section>
    </>
  );
}
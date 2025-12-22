// Example for app/privacy/page.tsx (repeat for others)
import Link from 'next/link';
import Image from 'next/image';

export default function PrivacyPage() {  // <-- This default export fixes the error
  return (
    <>
      {/* Hero */}
      <section className="relative h-screen w-full">
        <Image
          src="/privacy-hero.jpg"  // Your local image
          alt="Shield protecting patient privacy and data"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-teal-900/70" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-6">
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl">
            Privacy Policy
          </h1>
          <p className="text-2xl md:text-3xl font-light max-w-4xl drop-shadow-lg">
            Your patient data privacy is our highest priority · Last updated: December 22, 2025
          </p>
        </div>
      </section>

      {/* Your full content here (from previous message) */}
      <section className="py-24 px-6 bg-teal-50">
        {/* ... paste the rest of the content ... */}
      </section>
    </>
  );
}
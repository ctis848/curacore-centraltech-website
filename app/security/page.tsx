// app/security/page.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function SecurityPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-screen w-full">
        <Image
          src="/security-hero.jpg"
          alt="Secure lock protecting digital health records"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-teal-900/70" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-6">
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl">
            Security & Compliance
          </h1>
          <p className="text-2xl md:text-3xl font-light max-w-4xl drop-shadow-lg">
            Bank-level protection for your patient data
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 px-6 bg-teal-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-teal-100">
              <h3 className="text-3xl font-black text-teal-900 mb-6">Encryption</h3>
              <p className="text-lg text-gray-700">End-to-end AES-256 encryption for data at rest and in transit.</p>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-teal-100">
              <h3 className="text-3xl font-black text-teal-900 mb-6">Access Controls</h3>
              <p className="text-lg text-gray-700">Role-based permissions, multi-factor authentication, and audit logs.</p>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-teal-100">
              <h3 className="text-3xl font-black text-teal-900 mb-6">Data Centers</h3>
              <p className="text-lg text-gray-700">Secure Nigerian hosting with regular backups and disaster recovery.</p>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-teal-100">
              <h3 className="text-3xl font-black text-teal-900 mb-6">Compliance</h3>
              <p className="text-lg text-gray-700">HIPAA-inspired standards, regular security audits, and penetration testing.</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xl text-gray-700 mb-8">
              Your patient data is protected by industry-leading security measures.
            </p>
            <Link
              href="/contact"
              className="bg-yellow-400 text-teal-900 px-16 py-8 rounded-full text-3xl font-bold hover:bg-yellow-300 transition shadow-2xl inline-block"
            >
              Contact Security Team
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
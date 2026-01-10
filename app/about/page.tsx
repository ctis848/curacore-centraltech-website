// app/about/page.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <>
      {/* Hero Section with Local Doctor Team Background */}
      <section className="relative h-screen w-full">
        <Image
          src="/about-hero.jpg"  // Local file in /public/about-hero.jpg
          alt="Diverse team of smiling doctors and nurses representing healthcare excellence"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-teal-900/70" /> {/* Teal overlay for text readability */}

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-6">
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl">
            About CentralCore EMR
          </h1>
          <p className="text-2xl md:text-4xl mb-12 font-light max-w-4xl drop-shadow-lg">
            Empowering Healthcare Excellence Across Africa
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-24 px-6 bg-teal-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-black text-teal-900 mb-8">
                Our Story
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                Founded in Port Harcourt, Nigeria, Central Tech Information Systems Ltd. recognized a critical need: modern hospitals and clinics were struggling with outdated paper records, inefficient workflows, and fragmented systems.
              </p>
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                We built CentralCore EMR from the ground up — a powerful, secure, and intuitive Electronic Medical Record system designed specifically for the realities of African healthcare.
              </p>
              <p className="text-xl text-gray-700 leading-relaxed">
                Today, thousands of healthcare providers trust CentralCore to deliver better patient care, streamline operations, and drive digital transformation.
              </p>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-teal-100">
              <div className="bg-gray-200 border-2 border-dashed rounded-3xl w-full h-96 flex items-center justify-center text-gray-500 text-2xl">
                Your Real Team/Office Photo Here (Optional)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="bg-teal-50 rounded-3xl p-12 text-center border border-teal-200 shadow-xl">
              <h3 className="text-4xl font-black text-teal-900 mb-8">
                Our Mission
              </h3>
              <p className="text-xl text-gray-700 leading-relaxed">
                To empower healthcare providers with innovative, reliable, and affordable technology that improves patient outcomes and transforms medical practice across Africa.
              </p>
            </div>

            <div className="bg-yellow-50 rounded-3xl p-12 text-center border border-yellow-200 shadow-xl">
              <h3 className="text-4xl font-black text-teal-900 mb-8">
                Our Vision
              </h3>
              <p className="text-xl text-gray-700 leading-relaxed">
                A future where every hospital and clinic in Africa uses digital tools to deliver world-class care — efficiently, securely, and compassionately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-6 bg-teal-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black text-teal-900 mb-16">
            Why Healthcare Providers Choose CentralCore
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-teal-100">
              <div className="text-6xl mb-6">🇳🇬</div>
              <h3 className="text-3xl font-bold text-teal-900 mb-4">
                Built for Africa
              </h3>
              <p className="text-lg text-gray-700">
                Designed with local needs in mind — offline capability, power reliability, and Nigerian regulatory compliance.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-10 border border-teal-100">
              <div className="text-6xl mb-6">🔒</div>
              <h3 className="text-3xl font-bold text-teal-900 mb-4">
                Secure & Compliant
              </h3>
              <p className="text-lg text-gray-700">
                Bank-level encryption, HIPAA-inspired standards, and full data sovereignty in Nigeria.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-10 border border-teal-100">
              <div className="text-6xl mb-6">👩‍⚕️</div>
              <h3 className="text-3xl font-bold text-teal-900 mb-4">
                Doctor-Approved
              </h3>
              <p className="text-lg text-gray-700">
                Created with input from Nigerian physicians and nurses for intuitive, time-saving workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-teal-800 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-10">
            Ready to Join the Future of Healthcare?
          </h2>
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <Link
              href="/buy"
              className="bg-yellow-400 text-teal-900 px-16 py-8 rounded-full text-3xl font-bold hover:bg-yellow-300 transition shadow-2xl inline-block"
            >
              Get Started Today
            </Link>
            <Link
              href="/contact"
              className="bg-white/20 backdrop-blur-md text-white border-2 border-white px-16 py-8 rounded-full text-3xl font-bold hover:bg-white/30 transition shadow-2xl inline-block"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
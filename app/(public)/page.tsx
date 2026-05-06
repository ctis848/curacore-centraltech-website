import Navbar from "@/components/Navbar";
import Link from 'next/link';
import Image from 'next/image';
import EnhancedTestimonials from '@/components/EnhancedTestimonials';
import EMRCarousel from "@/components/EMRCarousel";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">

        {/* HERO */}
        <section className="relative h-[90vh] w-full overflow-hidden">
          <Image
            src="/hospital-bg.jpg"
            alt="Modern hospital background for CentralCore EMR"
            fill
            priority
            className="object-cover object-center scale-110 brightness-[0.85] animate-[heroZoom_12s_ease-in-out_infinite]"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-teal-900/90 via-teal-900/70 to-teal-900/40 backdrop-blur-[3px]" />

          <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-6">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              The Future of Hospital Intelligence
            </h1>

            <p className="text-2xl md:text-4xl mb-10 font-light max-w-4xl leading-snug opacity-95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
              CentralCore EMR — a next‑generation clinical ecosystem engineered to elevate patient care,
              streamline operations, and power the modern digital hospital.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 md:gap-8">
              <Link
                href="/buy"
                className="bg-yellow-400 text-teal-900 px-10 py-5 md:px-12 md:py-6 rounded-full text-xl md:text-2xl font-bold shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:bg-yellow-300 hover:scale-105 transition-all duration-300"
              >
                Buy License — Begin Your Digital Transformation
              </Link>

              <Link
                href="/products"
                className="bg-white/20 backdrop-blur-md text-white border-2 border-white/40 px-10 py-5 md:px-12 md:py-6 rounded-full text-xl md:text-2xl font-bold shadow-[0_10px_25px_rgba(255,255,255,0.15)] hover:bg-white/30 hover:scale-105 transition-all duration-300"
              >
                Discover the Technology
              </Link>

              <Link
                href="/download"
                className="bg-teal-500 text-white px-10 py-5 md:px-12 md:py-6 rounded-full text-xl md:text-2xl font-bold shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:bg-teal-600 hover:scale-105 transition-all duration-300"
              >
                Experience the EMR App
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES PREVIEW */}
        <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto space-y-12">
          <h2 className="text-4xl md:text-5xl font-black text-teal-800 dark:text-teal-300 text-center">
            Why Hospitals Choose CentralCore EMR
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { title: "Smart Patient Records", desc: "Access AI‑enhanced patient histories with instant visibility into vitals, diagnostics, and treatment timelines.", icon: "🩺" },
              { title: "Integrated Pharmacy", desc: "A synchronized pharmacy engine that automates prescriptions, stock intelligence, and medication safety workflows.", icon: "💊" },
              { title: "Laboratory Automation", desc: "Accelerated diagnostics with automated lab workflows and real‑time result delivery into patient charts.", icon: "🧪" },
              { title: "Hospital Surveillance", desc: "Unified CCTV monitoring embedded directly into your hospital dashboard for proactive operational oversight.", icon: "📹" },
              { title: "Nurse Call System", desc: "An intelligent nurse‑call network enabling faster patient response and optimized ward coordination.", icon: "🔔" },
              { title: "Digital Signage", desc: "Dynamic hospital‑wide displays for patient queues, announcements, and real‑time service updates.", icon: "🖥️" }
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-teal-200 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="text-2xl font-bold text-teal-800 dark:text-teal-300 mb-3">{f.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* EMR CAROUSEL SECTION */}
        <section className="py-24 px-6 md:px-10 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-teal-800 dark:text-teal-300 text-center mb-6">
              CentralCore EMR — Live Preview
            </h2>

            <p className="text-center text-gray-700 dark:text-gray-300 max-w-3xl mx-auto text-lg md:text-xl mb-14">
              An immersive, high‑definition showcase of CentralCore EMR — revealing refined clinical workflows,
              intelligent real‑time dashboards, and a seamless patient‑care ecosystem engineered for
              next‑generation hospitals.
            </p>

            <EMRCarousel />

            <div className="text-center mt-14">
              <Link
                href="/products"
                className="inline-block px-10 py-4 bg-teal-600 text-white rounded-full text-xl font-bold shadow-lg hover:bg-teal-700 hover:scale-105 transition-all duration-300"
              >
                Explore Full EMR Features
              </Link>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24 px-6 md:px-10 bg-gradient-to-br from-teal-900 to-teal-800 text-white">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            <h2 className="text-5xl md:text-6xl font-black tracking-tight">
              Transform Your Hospital Into a Smart Healthcare Institution
            </h2>

            <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto opacity-90">
              CentralCore EMR empowers your team with intelligent automation, real‑time insights,
              and a seamless digital workflow designed for excellence in patient care.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/buy"
                className="bg-yellow-400 text-teal-900 px-12 py-6 rounded-full text-2xl md:text-3xl font-bold shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:bg-yellow-300 hover:scale-105 transition-all duration-300"
              >
                Begin Your Digital Transformation
              </Link>

              <Link
                href="/download"
                className="bg-white text-teal-900 px-12 py-6 rounded-full text-2xl md:text-3xl font-bold shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:bg-gray-100 hover:scale-105 transition-all duration-300"
              >
                Get the EMR App
              </Link>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-24 px-6 md:px-10 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-4xl md:text-5xl font-black text-teal-800 dark:text-teal-300 text-center mb-6">
            Trusted by Forward‑Thinking Hospitals
          </h2>

          <p className="text-center text-gray-700 dark:text-gray-300 max-w-3xl mx-auto text-lg md:text-xl mb-14">
            Discover how CentralCore EMR is transforming clinical efficiency, elevating patient outcomes,
            and redefining digital healthcare across leading medical institutions.
          </p>

          <EnhancedTestimonials />
        </section>
      </div>

      <WhatsAppButton />
    </>
  );
}

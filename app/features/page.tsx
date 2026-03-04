import Image from 'next/image';
import Link from 'next/link';
import { 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  ImageIcon, 
  CreditCard, 
  Camera, 
  Bell, 
  Monitor, 
  ShieldCheck 
} from 'lucide-react';

export const metadata = {
  title: "CentralCore EMR Features | Complete Hospital Management System",
  description:
    "Explore all CentralCore EMR features including EMR, pharmacy, lab, radiology, billing, surveillance, nurse call, digital signage, and machine licensing.",
};

export default function FeaturesPage() {
  const features = [
    {
      title: "Electronic Medical Records",
      desc: "Unified patient histories, vitals, diagnoses, and clinical notes with secure access and real‑time updates.",
      icon: <Stethoscope className="w-12 h-12 text-teal-700" />
    },
    {
      title: "Pharmacy Management",
      desc: "Automated dispensing, stock tracking, prescription validation, and medication safety alerts.",
      icon: <Pill className="w-12 h-12 text-teal-700" />
    },
    {
      title: "Laboratory Integration",
      desc: "Seamless lab result processing with automated uploads directly into patient charts.",
      icon: <FlaskConical className="w-12 h-12 text-teal-700" />
    },
    {
      title: "Radiology & Imaging",
      desc: "Upload, view, and manage X‑rays, CT scans, and MRIs with PACS‑style integration.",
      icon: <ImageIcon className="w-12 h-12 text-teal-700" />
    },
    {
      title: "Billing & Finance",
      desc: "Automated invoicing, insurance claims, payment tracking, and financial reporting.",
      icon: <CreditCard className="w-12 h-12 text-teal-700" />
    },
    {
      title: "Hospital Surveillance",
      desc: "CCTV monitoring integrated into your dashboard for improved security and oversight.",
      icon: <Camera className="w-12 h-12 text-teal-700" />
    },
    {
      title: "Nurse Call System",
      desc: "Instant alerts from patients to nurses for faster response and improved care.",
      icon: <Bell className="w-12 h-12 text-teal-700" />
    },
    {
      title: "Digital Signage",
      desc: "Display patient queues, announcements, and hospital updates in real time.",
      icon: <Monitor className="w-12 h-12 text-teal-700" />
    },
    {
      title: "Machine Licensing",
      desc: "Register, activate, and manage all hospital devices with secure license control.",
      icon: <ShieldCheck className="w-12 h-12 text-teal-700" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">

      {/* BREADCRUMBS */}
      <nav className="px-4 sm:px-6 md:px-10 py-4 text-sm text-gray-600">
        <Link href="/" className="hover:text-teal-700">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-teal-700 font-semibold">Features</span>
      </nav>

      {/* HERO */}
      <section className="relative h-[45vh] sm:h-[55vh] md:h-[60vh] w-full overflow-hidden">
        <Image
          src="/hospital-bg.jpg"
          alt="CentralCore EMR Features"
          fill
          priority
          className="object-cover object-center scale-110 sm:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/80 via-teal-900/60 to-teal-900/40" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-3 sm:mb-4 drop-shadow-xl leading-tight">
            Powerful Features for Modern Healthcare
          </h1>

          <p className="text-base sm:text-lg md:text-2xl font-light max-w-2xl sm:max-w-3xl drop-shadow-lg leading-relaxed">
            CentralCore EMR brings together every tool your hospital needs — fast, secure, and beautifully integrated.
          </p>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto space-y-12 sm:space-y-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-teal-800 text-center leading-tight">
          Everything Your Hospital Needs in One System
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-teal-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="mb-4">{f.icon}</div>
              <h3 className="text-xl sm:text-2xl font-bold text-teal-800 mb-2 sm:mb-3">
                {f.title}
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-10 bg-gradient-to-br from-teal-900 to-teal-800 text-white">
        <div className="max-w-5xl mx-auto text-center space-y-8 sm:space-y-10">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight">
            Experience the Future of Healthcare
          </h2>

          <p className="text-base sm:text-lg md:text-2xl font-light max-w-2xl sm:max-w-3xl mx-auto leading-relaxed">
            CentralCore EMR is built to help hospitals deliver faster, safer, and smarter patient care.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <Link
              href="/buy"
              className="bg-yellow-400 text-teal-900 px-8 py-4 sm:px-12 sm:py-6 rounded-full text-lg sm:text-2xl md:text-3xl font-bold shadow-2xl hover:bg-yellow-300 hover:scale-105 transition-all duration-300 text-center"
            >
              Buy License Now
            </Link>

            <Link
              href="/download"
              className="bg-white text-teal-900 px-8 py-4 sm:px-12 sm:py-6 rounded-full text-lg sm:text-2xl md:text-3xl font-bold shadow-2xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 text-center"
            >
              Download App
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

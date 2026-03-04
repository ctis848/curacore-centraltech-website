import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpen,
  Settings,
  Code,
  Video,
  LifeBuoy,
  FileText,
} from 'lucide-react';

export const metadata = {
  title: "Resources & Documentation | CentralCore EMR",
  description:
    "Access user guides, installation manuals, API documentation, tutorials, release notes, and support resources for CentralCore EMR.",
};

export default function ResourcesPage() {
  const resources = [
    {
      title: "User Documentation",
      desc: "Step‑by‑step guides for doctors, nurses, pharmacists, and administrators.",
      icon: <BookOpen className="w-12 h-12 text-teal-700" />,
      link: "/docs",
    },
    {
      title: "Installation Guide",
      desc: "Everything you need to install and configure CentralCore EMR.",
      icon: <Settings className="w-12 h-12 text-teal-700" />,
      link: "/docs/installation",
    },
    {
      title: "API Reference",
      desc: "Integrate CentralCore EMR with third‑party systems and hospital devices.",
      icon: <Code className="w-12 h-12 text-teal-700" />,
      link: "/docs/api",
    },
    {
      title: "Video Tutorials",
      desc: "Learn how to use CentralCore EMR with easy‑to‑follow video lessons.",
      icon: <Video className="w-12 h-12 text-teal-700" />,
      link: "/resources/videos",
    },
    {
      title: "Support Center",
      desc: "Get help, open tickets, and chat with our support team.",
      icon: <LifeBuoy className="w-12 h-12 text-teal-700" />,
      link: "/support",
    },
    {
      title: "Release Notes",
      desc: "See what's new in the latest CentralCore EMR updates.",
      icon: <FileText className="w-12 h-12 text-teal-700" />,
      link: "/resources/releases",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">

      {/* BREADCRUMBS */}
      <nav className="px-4 sm:px-6 md:px-10 py-4 text-sm text-gray-600">
        <Link href="/" className="hover:text-teal-700">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-teal-700 font-semibold">Resources</span>
      </nav>

      {/* HERO */}
      <section className="relative h-[45vh] sm:h-[55vh] md:h-[60vh] w-full overflow-hidden">
        <Image
          src="/hospital-bg.jpg"
          alt="CentralCore EMR Resources"
          fill
          priority
          className="object-cover object-center scale-110 sm:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/80 via-teal-900/60 to-teal-900/40" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-3 sm:mb-4 drop-shadow-xl leading-tight">
            Resources & Documentation
          </h1>

          <p className="text-base sm:text-lg md:text-2xl font-light max-w-2xl sm:max-w-3xl drop-shadow-lg leading-relaxed">
            Everything you need to learn, deploy, and master CentralCore EMR.
          </p>
        </div>
      </section>

      {/* RESOURCES GRID */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto space-y-12 sm:space-y-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-teal-800 text-center leading-tight">
          Explore Our Resource Library
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          {resources.map((r, i) => (
            <Link
              key={i}
              href={r.link}
              className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-teal-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="mb-4">{r.icon}</div>
              <h3 className="text-xl sm:text-2xl font-bold text-teal-800 mb-2 sm:mb-3">
                {r.title}
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {r.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-10 bg-gradient-to-br from-teal-900 to-teal-800 text-white">
        <div className="max-w-5xl mx-auto text-center space-y-8 sm:space-y-10">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight">
            Need Help Getting Started?
          </h2>

          <p className="text-base sm:text-lg md:text-2xl font-light max-w-2xl sm:max-w-3xl mx-auto leading-relaxed">
            Our support team is ready to assist you with installation, training, and troubleshooting.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <Link
              href="/support"
              className="bg-yellow-400 text-teal-900 px-8 py-4 sm:px-12 sm:py-6 rounded-full text-lg sm:text-2xl md:text-3xl font-bold shadow-2xl hover:bg-yellow-300 hover:scale-105 transition-all duration-300 text-center"
            >
              Visit Support Center
            </Link>

            <Link
              href="/contact"
              className="bg-white text-teal-900 px-8 py-4 sm:px-12 sm:py-6 rounded-full text-lg sm:text-2xl md:text-3xl font-bold shadow-2xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 text-center"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

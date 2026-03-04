'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function DownloadPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">

      {/* HERO */}
      <section className="relative h-[45vh] sm:h-[55vh] md:h-[60vh] w-full overflow-hidden">
        <Image
          src="/hospital-bg.jpg"
          alt="Download CentralCore EMR"
          fill
          priority
          className="object-cover object-center scale-110 sm:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/80 via-teal-900/60 to-teal-900/40 backdrop-blur-[2px]" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-3 sm:mb-4 drop-shadow-xl tracking-tight leading-tight">
            Download CentralCore EMR
          </h1>

          <p className="text-base sm:text-lg md:text-2xl font-light max-w-2xl sm:max-w-3xl drop-shadow-lg leading-relaxed">
            Choose your platform and start using the most advanced EMR system for modern hospitals.
          </p>
        </div>
      </section>

      {/* DOWNLOAD OPTIONS */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto space-y-12 sm:space-y-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-teal-800 text-center leading-tight">
          Available Downloads
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">

          {[
            {
              title: "Windows Installer",
              desc: "Download the full CentralCore EMR desktop application for Windows.",
              icon: "🖥️",
              link: "/downloads/centralcore-windows.exe",
              btn: "Download for Windows"
            },
            {
              title: "macOS Installer",
              desc: "Optimized version of CentralCore EMR for macOS devices.",
              icon: "🍎",
              link: "/downloads/centralcore-mac.dmg",
              btn: "Download for macOS"
            },
            {
              title: "Linux Package",
              desc: "Install CentralCore EMR on Ubuntu, Debian, or other Linux distributions.",
              icon: "🐧",
              link: "/downloads/centralcore-linux.AppImage",
              btn: "Download for Linux"
            },
            {
              title: "Android App",
              desc: "Access CentralCore EMR on the go with the Android mobile app.",
              icon: "📱",
              link: "/downloads/centralcore-android.apk",
              btn: "Download APK"
            },
            {
              title: "iOS App",
              desc: "Use CentralCore EMR on iPhone and iPad (App Store link).",
              icon: "📲",
              link: "https://apps.apple.com",
              btn: "Open in App Store"
            },
            {
              title: "User Manual (PDF)",
              desc: "Complete documentation for installation, usage, and troubleshooting.",
              icon: "📘",
              link: "/downloads/centralcore-manual.pdf",
              btn: "Download Manual"
            }
          ].map((d, i) => (
            <div
              key={i}
              className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-teal-200 flex flex-col justify-between"
            >
              <div>
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{d.icon}</div>
                <h3 className="text-xl sm:text-2xl font-bold text-teal-800 mb-2 sm:mb-3">{d.title}</h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-6">{d.desc}</p>
              </div>

              <a
                href={d.link}
                className="bg-teal-700 text-white text-center py-3 rounded-xl font-semibold text-sm sm:text-base hover:bg-teal-800 transition"
                download
              >
                {d.btn}
              </a>
            </div>
          ))}

        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-10 bg-gradient-to-br from-teal-900 to-teal-800 text-white">
        <div className="max-w-5xl mx-auto text-center space-y-8 sm:space-y-10">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Need Help Installing CentralCore EMR?
          </h2>

          <p className="text-base sm:text-lg md:text-2xl font-light max-w-2xl sm:max-w-3xl mx-auto leading-relaxed">
            Our support team is ready to guide you through installation, setup, and activation.
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

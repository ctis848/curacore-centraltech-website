// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const showcaseImages = [
  { src: "/showcase/emr-dashboard.jpg", alt: "CuraCore EMR Dashboard - Personalized home page" },
  { src: "/showcase/patient-chart.jpg", alt: "Digital Patient Chart - Real-time clinical notes and vitals" },
  { src: "/showcase/pharmacy.jpg", alt: "Pharmacy Module - Prescription and inventory management" },
  { src: "/showcase/lab-results.jpg", alt: "Laboratory Integration - Fast results and reporting" },
  { src: "/showcase/cctv.jpg", alt: "CCTV Security Surveillance - Hospital-wide monitoring" },
  { src: "/showcase/nurse-call.jpg", alt: "Nurse Call Bell System - Instant patient assistance" },
  { src: "/showcase/digital-signage.jpg", alt: "Digital Signage - Patient information displays" },
  { src: "/showcase/fiber-optic.jpg", alt: "Fiber Optic Network - High-speed connectivity" },
];

export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % showcaseImages.length);
    }, 5000); // Change every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Hero */}
      <div className="relative h-screen w-full">
        <Image
          src="/image-2.jpg"
          alt="Doctor using futuristic tablet interface for EHR/EMR and telemedicine"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-teal-900/70" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-6">
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl">
            CuraCore EMR
          </h1>
          <p className="text-2xl md:text-4xl mb-12 font-light max-w-4xl drop-shadow-lg">
            A Complete Electronic Medical Record System for Modern Healthcare
          </p>
          <div className="flex flex-col sm:flex-row gap-8">
            <Link
              href="/buy"
              className="bg-yellow-400 text-teal-900 px-12 py-6 rounded-full text-2xl font-bold hover:bg-yellow-300 transition shadow-2xl"
            >
              Buy License Now
            </Link>
            <Link
              href="/products"
              className="bg-white/20 backdrop-blur-md text-white border-2 border-white px-12 py-6 rounded-full text-2xl font-bold hover:bg-white/30 transition shadow-2xl"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </div>

      {/* Big Rotating Flash Cards Carousel */}
      <section className="py-24 px-6 bg-teal-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black text-teal-900 mb-16">
            See CuraCore in Action
          </h2>
          <div className="relative max-w-5xl mx-auto">
            <div className="overflow-hidden rounded-3xl shadow-2xl border-8 border-white">
              <Image
                src={showcaseImages[currentIndex].src}
                alt={showcaseImages[currentIndex].alt}
                width={1200}
                height={800}
                className="w-full h-auto object-contain transition-opacity duration-1000"
                priority
              />
            </div>
            <p className="text-xl text-gray-700 mt-8 italic">
              {showcaseImages[currentIndex].alt}
            </p>
            <div className="flex justify-center gap-3 mt-8">
              {showcaseImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-4 h-4 rounded-full transition ${
                    i === currentIndex ? 'bg-teal-900' : 'bg-teal-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-teal-900 mb-8">
            Trusted by Healthcare Providers Worldwide
          </h2>
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Join thousands of hospitals and clinics transforming patient care with CuraCore EMR — secure, intuitive, and powerful.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-6 bg-teal-800 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-10">
            Ready to Modernize Your Practice?
          </h2>
          <Link
            href="/buy"
            className="bg-yellow-400 text-teal-900 px-16 py-8 rounded-full text-3xl font-bold hover:bg-yellow-300 transition shadow-2xl inline-block"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </>
  );
}
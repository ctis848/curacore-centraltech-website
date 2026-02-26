// app/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const showcaseImages = [
  { src: "/showcase/emr-dashboard.jpg", alt: "CentralCore EMR Dashboard - Personalized home page" },
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
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <Image
          src="/images/hero/image-2.jpg" // Confirm this file exists in public/images/hero/
          alt="Doctor using CentralCore EMR on tablet"
          fill
          className="object-cover brightness-75"
          priority
          quality={85}
          onError={(e) => {
            e.currentTarget.src = '/images/fallback-hero.jpg'; // fallback if missing
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/60 to-transparent" />

        <div className="relative z-10 text-center text-white px-6 max-w-5xl">
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl animate-fade-in">
            CentralCore EMR
          </h1>
          <p className="text-2xl md:text-4xl mb-12 font-light drop-shadow-lg animate-fade-in delay-200">
            A Complete Electronic Medical Record System for Modern Healthcare
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in delay-400">
            <Link href="/buy">
              <button className="bg-yellow-400 hover:bg-yellow-300 text-teal-900 font-bold py-5 px-12 rounded-full text-xl shadow-2xl transition transform hover:scale-105">
                Buy License Now
              </button>
            </Link>
            <Link href="/services">
              <button className="bg-white/20 backdrop-blur-md text-white border-2 border-white px-12 py-5 rounded-full text-xl font-bold hover:bg-white/30 transition transform hover:scale-105">
                Explore Features
              </button>
            </Link>
            <Link href="/download">
              <button className="bg-teal-500 hover:bg-teal-600 text-white px-12 py-5 rounded-full text-xl font-bold shadow-2xl transition transform hover:scale-105">
                Download App
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Showcase Carousel */}
      <section className="py-24 px-6 bg-teal-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black text-teal-900 mb-16">
            See CentralCore EMR in Action
          </h2>

          <div className="relative max-w-6xl mx-auto">
            <div className="overflow-hidden rounded-3xl shadow-2xl border-8 border-white bg-gray-100">
              <Image
                src={showcaseImages[currentIndex]?.src || '/images/fallback-placeholder.jpg'}
                alt={showcaseImages[currentIndex]?.alt || 'Showcase image'}
                width={1200}
                height={800}
                className="w-full h-auto object-cover transition-opacity duration-1000"
                priority={currentIndex <= 1} // priority for first two images
                quality={85}
                onError={(e) => {
                  e.currentTarget.src = '/images/fallback-placeholder.jpg';
                }}
              />
            </div>

            <p className="text-xl md:text-2xl text-gray-700 mt-8 italic">
              {showcaseImages[currentIndex]?.alt || 'Showcase loading...'}
            </p>

            <div className="flex justify-center gap-4 mt-8">
              {showcaseImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-5 h-5 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? 'bg-teal-900 scale-125 shadow-lg'
                      : 'bg-teal-300 hover:bg-teal-500'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black text-teal-900 mb-10">
            Ready to Transform Your Practice?
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/buy">
              <button className="bg-yellow-400 hover:bg-yellow-300 text-teal-900 font-bold py-6 px-14 rounded-full text-2xl shadow-2xl transition transform hover:scale-105">
                Buy License Now
              </button>
            </Link>
            <Link href="/download">
              <button className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-6 px-14 rounded-full text-2xl shadow-2xl transition transform hover:scale-105">
                Download App
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
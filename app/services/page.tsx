// app/services/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

const services = [
  { title: "CCTV Security Surveillance", image: "/showcase/cctv.jpg", desc: "Advanced CCTV systems for hospital security, patient monitoring, and asset protection." },
  { title: "Nurses Call Bell System", image: "/showcase/nurse-call.jpg", desc: "Reliable nurse call systems for quick patient assistance and improved response times." },
  { title: "Fire Alarm System", image: "/showcase/fire-alarm.jpg", desc: "Complete fire detection and alarm systems with sensors, panels, and emergency response integration." },
  { title: "Fiber Optic Network System", image: "/showcase/fiber-optic.jpg", desc: "High-speed fiber optic installation for reliable, future-proof hospital connectivity." },
  { title: "Local Area Network System", image: "/showcase/lan-network.jpg", desc: "Secure LAN setup for seamless data sharing across departments and workstations." },
  { title: "Custom Software Development", image: "/showcase/software-dev.jpg", desc: "Tailored web and desktop applications built to your exact healthcare needs." },
  { title: "IP Intercom System", image: "/showcase/intercom.jpg", desc: "Modern IP-based intercom for clear communication between wards, departments, and security." },
  { title: "RFID Door/Gate System", image: "/showcase/rfid-access.jpg", desc: "RFID access control for secure entry to restricted areas like pharmacy and wards." },
  { title: "Digital Signage System", image: "/showcase/digital-signage.jpg", desc: "Digital signage and information displays for waiting areas, directions, and announcements." },
  { title: "Smart Automation System", image: "/showcase/smart-home.jpg", desc: "Smart automation solutions for staff quarters or integrated hospital facilities." },
  { title: "CentralCore EMR Implementation", image: "/showcase/emr-implementation.jpg", desc: "Full installation, training, data migration, and ongoing support for CentralCore EMR." },
];

export default function ServicesPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const handleRequestQuote = (title: string) => {
    setSelectedService(title);
    setShowForm(true);
  };

  return (
    <>
      {/* Hero */}
      <section className="relative bg-teal-900 py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-800 to-teal-950 opacity-90"></div>
        <div className="relative max-w-6xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl">
            Our Professional Services
          </h1>
          <p className="text-2xl md:text-3xl mb-12 font-light max-w-4xl mx-auto drop-shadow-lg">
            End-to-end technology solutions for modern healthcare facilities
          </p>
        </div>
      </section>

      {/* Image-Rich Service Cards */}
      <section className="py-24 px-6 bg-teal-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black text-teal-900 text-center mb-16">
            Comprehensive Healthcare IT Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-xl overflow-hidden border border-teal-100 hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <div className="relative h-64">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-3xl font-bold text-teal-900 mb-4">
                    {service.title}
                  </h3>
                  <p className="text-lg text-gray-700 mb-8">
                    {service.desc}
                  </p>
                  <button
                    onClick={() => handleRequestQuote(service.title)}
                    className="w-full bg-yellow-400 text-teal-900 py-4 rounded-xl text-xl font-bold hover:bg-yellow-300 transition shadow-lg"
                  >
                    Request Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Modal & CTA remain the same as previous version */}
      {/* ... (keep your existing modal and CTA code) ... */}
    </>
  );
}
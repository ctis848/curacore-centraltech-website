'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleRequestQuote = useCallback((title: string) => {
    setSelectedService(title);
    setShowForm(true);
    setStatus('idle');
    setMessage('');
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    console.log('Submitting quote request with data:', { ...formData, service: selectedService });

    try {
      const res = await fetch('/.netlify/functions/send-quote-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          service: selectedService,
        }),
      });

      console.log('Response status:', res.status);

      const text = await res.text();
      console.log('Raw response:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Invalid JSON from server');
      }

      if (res.ok) {
        setStatus('success');
        setMessage('Quote request sent successfully! We will contact you soon.');
        setTimeout(() => {
          setShowForm(false);
          setFormData({ name: '', email: '', phone: '', message: '' });
        }, 3000);
      } else {
        throw new Error(data?.error || 'Failed to send request');
      }
    } catch (err: unknown) {
      console.error('Form submit error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again later.';
      setStatus('error');
      setMessage(errorMessage);
    }
  };

  // Close modal on Esc key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowForm(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-900 to-teal-950 py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-7xl mx-auto text-center text-white z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-2xl">
            Our Professional Services
          </h1>
          <p className="text-xl md:text-3xl font-light max-w-4xl mx-auto drop-shadow-lg">
            Comprehensive technology solutions built for modern healthcare facilities
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 px-6 bg-gradient-to-b from-teal-50 to-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extrabold text-teal-900 text-center mb-16">
            Healthcare IT & Infrastructure Services
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl shadow-lg overflow-hidden border border-teal-100 hover:shadow-2xl hover:scale-[1.03] transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index < 3}
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-teal-900 mb-4">
                    {service.title}
                  </h3>
                  <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                    {service.desc}
                  </p>
                  <button
                    onClick={() => handleRequestQuote(service.title)}
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-teal-900 py-4 rounded-xl text-xl font-bold transition shadow-md hover:shadow-lg"
                  >
                    Request Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Request Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-6 text-gray-600 hover:text-gray-900 text-4xl font-bold"
              aria-label="Close"
            >
              ×
            </button>

            <h2 className="text-3xl md:text-4xl font-extrabold text-teal-900 mb-6 text-center">
              Request Quote for<br />
              <span className="text-yellow-600">{selectedService}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Your Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Your Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Details
                </label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Additional details or requirements..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className={`w-full py-4 rounded-xl text-xl font-bold transition-all ${
                  status === 'loading'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {status === 'loading' ? 'Sending...' : 'Send Quote Request'}
              </button>

              {status === 'success' && (
                <p className="text-green-600 text-center font-medium mt-4">{message}</p>
              )}
              {status === 'error' && (
                <p className="text-red-600 text-center font-medium mt-4">{message}</p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
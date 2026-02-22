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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleRequestQuote = (title: string) => {
    setSelectedService(title);
    setShowForm(true);
    setStatus('idle');
    setMessage('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/.netlify/functions/send-quote-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          service: selectedService,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('Quote request sent successfully! We will contact you soon.');
        setTimeout(() => {
          setShowForm(false);
          setFormData({ name: '', email: '', phone: '', message: '' });
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to send request. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Something went wrong. Please try again later.');
    }
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

      {/* Service Cards */}
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

      {/* Quote Request Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-6 text-gray-500 hover:text-gray-800 text-3xl"
            >
              ×
            </button>

            <h2 className="text-3xl font-bold text-teal-900 mb-6 text-center">
              Request Quote for<br />
              <span className="text-yellow-600">{selectedService}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                name="name"
                placeholder="Your Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Your Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <textarea
                name="message"
                placeholder="Additional details or requirements..."
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />

              <button
                type="submit"
                disabled={status === 'loading'}
                className={`w-full py-4 rounded-xl text-xl font-bold transition ${
                  status === 'loading'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                {status === 'loading' ? 'Sending...' : 'Send Quote Request'}
              </button>

              {status === 'success' && (
                <p className="text-green-600 text-center font-medium">{message}</p>
              )}
              {status === 'error' && (
                <p className="text-red-600 text-center font-medium">{message}</p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
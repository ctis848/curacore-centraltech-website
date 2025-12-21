// app/services/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

const services = [
  {
    title: 'CCTV Security Surveillance',
    description: 'Advanced CCTV systems for hospital security, patient monitoring, and asset protection.',
    image: 'https://www.vulcansecuritysystems.com/wp-content/uploads/2022/05/VSS-SecurityCamerasforPatientMonitoring.png',
  },
  {
    title: 'Nurses Call Bell System',
    description: 'Reliable nurse call systems for quick patient assistance and improved response times.',
    image: 'https://hackster.imgix.net/uploads/cover_image/file/153269/nursecall.png?auto=compress&w=900&h=675&fit=min&fm=jpg',
  },
  {
    title: 'Fire Alarm System',
    description: 'Complete fire detection and alarm systems with sensors, panels, and emergency response integration.',
    image: 'https://www.lifesafetycom.com/wp-content/uploads/2021/04/101868785_s-1200x800.jpg',
  },
  {
    title: 'Fiber Optic Network System',
    description: 'High-speed fiber optic installation for reliable, future-proof hospital connectivity.',
    image: 'https://www.ofsoptics.com/wp-content/uploads/ftth-ofs-solutions.png',
  },
  {
    title: 'Local Area Network System',
    description: 'Secure LAN setup for seamless data sharing across departments and workstations.',
    image: 'https://www.conceptdraw.com/How-To-Guide/picture/Computer-and-networks-Local-area-network-diagram.png',
  },
  {
    title: 'Customise Software Development: Web/Desktop App',
    description: 'Tailored web and desktop applications built to your exact healthcare needs.',
    image: 'https://www.pngkey.com/png/detail/252-2527689_custom-web-application-development-custom-software-development-icon.png',
  },
  {
    title: 'IP Intercom System',
    description: 'Modern IP-based intercom for clear communication between wards, departments, and security.',
    image: 'https://saitell.com/wp-content/uploads/2017/10/Hospital-IP-Intercom-System-Connection.jpg',
  },
  {
    title: 'Rf Door/Gate System',
    description: 'RFID access control for secure entry to restricted areas like pharmacy and wards.',
    image: 'https://www.encstore.com/assets/blogs/bcat1/1682512553-rfid-gate-access-control-system.webp',
  },
  {
    title: 'Medial Display System',
    description: 'Digital signage and information displays for waiting areas, directions, and announcements.',
    image: 'https://www.screenage.com/wp-content/uploads/2024/03/Healthcare-digital-signage2.jpg',
  },
  {
    title: 'Home Automated System',
    description: 'Smart automation solutions for staff quarters or integrated hospital facilities.',
    image: 'https://www.okw.com/en/Control-panel-for-home-automation/Steuerung_SmartHome_ApplicationImage500x408.jpg',
  },
  {
    title: 'Implementation of Our EMR CuraCore Software',
    description: 'Full installation, training, data migration, and ongoing support for CuraCore EMR.',
    image: 'https://www.docvilla.com/wp-content/uploads/2025/05/ehr-setup-implementation-guide-for-new-medical-practices-2.jpg',
  },
];

export default function ServicesPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    hospital: '',
    message: '',
  });

  const handleRequestQuote = (title: string) => {
    setSelectedService(title);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Quote request sent for: ${selectedService}\nWe'll contact you soon!`);
    setShowForm(false);
    setFormData({ name: '', email: '', phone: '', hospital: '', message: '' });
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-teal-900 py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-800 to-teal-950 opacity-90"></div>
        <div className="relative max-w-6xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl">
            Our Professional Services
          </h1>
          <p className="text-2xl md:text-3xl mb-12 font-light max-w-4xl mx-auto drop-shadow-lg">
            End-to-end technology solutions for modern healthcare facilities
          </p>
          <button
            onClick={() => window.scrollTo({ top: document.getElementById('services')?.offsetTop || 0, behavior: 'smooth' })}
            className="bg-white/20 backdrop-blur-md text-white border-2 border-white px-12 py-6 rounded-full text-2xl font-bold hover:bg-white/30 transition shadow-2xl"
          >
            View All Services
          </button>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-24 px-6 bg-teal-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black text-teal-900 text-center mb-16">
            Comprehensive Technology Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 flex flex-col border border-teal-100"
              >
                <div className="relative h-64">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-3xl font-bold text-teal-900 mb-4 text-center">
                      {service.title}
                    </h3>
                    <p className="text-lg text-gray-700 text-center mb-8 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-3xl p-10 max-w-2xl w-full">
            <h2 className="text-4xl md:text-5xl font-black text-teal-900 mb-8 text-center">
              Request Quote: {selectedService}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                placeholder="Your Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-6 py-4 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 focus:outline-none transition"
              />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-6 py-4 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 focus:outline-none transition"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-6 py-4 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 focus:outline-none transition"
              />
              <input
                type="text"
                placeholder="Hospital/Clinic Name"
                required
                value={formData.hospital}
                onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                className="w-full px-6 py-4 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 focus:outline-none transition"
              />
              <textarea
                placeholder="Tell us about your requirements (optional)"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-6 py-4 border-2 border-teal-200 rounded-xl text-lg focus:border-teal-500 focus:outline-none transition resize-none"
              />
              <div className="flex gap-6 justify-center pt-4">
                <button
                  type="submit"
                  className="bg-teal-800 text-white px-12 py-5 rounded-xl text-xl font-bold hover:bg-teal-700 transition shadow-lg"
                >
                  Send Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-600 text-white px-12 py-5 rounded-xl text-xl font-bold hover:bg-gray-700 transition shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Final CTA */}
      <section className="py-24 px-6 bg-teal-800 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-8">
            Ready to Upgrade Your Healthcare Facility?
          </h2>
          <p className="text-2xl mb-12 max-w-3xl mx-auto">
            Contact us for professional consultation, installation, and support
          </p>
          <a
            href="/support"
            className="bg-yellow-400 text-teal-900 px-16 py-8 rounded-full text-3xl font-bold hover:bg-yellow-300 transition shadow-2xl inline-block"
          >
            Contact Us Today
          </a>
        </div>
      </section>
    </>
  );
}
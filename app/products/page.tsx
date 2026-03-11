'use client';

const features = [
  {
    title: 'Patients Management',
    description: 'Comprehensive patient registration, demographics, history, and family records with advanced search and filtering.',
    icon: '👥',
  },
  {
    title: 'Medical Records',
    description: 'Secure, structured electronic health records with timeline view, notes, vitals, and attachments.',
    icon: '📋',
  },
  {
    title: 'Medical Forms',
    description: 'Customizable digital forms, templates, and e-signatures for consultations, consent, and assessments.',
    icon: '📄',
  },
  {
    title: 'Document Management',
    description: 'Centralized storage for scans, reports, referrals, and certificates with version control and access permissions.',
    icon: '📁',
  },
  {
    title: 'Medical Scheduling',
    description: 'Intelligent appointment booking, calendar sync, reminders, and waiting list management.',
    icon: '🗓️',
  },
  {
    title: 'Medical Workflows',
    description: 'Automated clinical pathways, task assignment, approvals, and protocol enforcement.',
    icon: '⚙️',
  },
  {
    title: 'Medical Billing and Claims',
    description: 'Integrated billing, insurance claims processing, invoicing, and payment tracking.',
    icon: '💳',
  },
  {
    title: 'Inventory Management',
    description: 'Real-time tracking of drugs, supplies, equipment with low-stock alerts and expiry management.',
    icon: '📦',
  },
  {
    title: 'Wards Management',
    description: 'Bed allocation, admission/discharge, ward rounds, and patient monitoring dashboard.',
    icon: '🏥',
  },
  {
    title: 'Nurses Module',
    description: 'Nursing notes, vital signs charting, medication administration, and care plans.',
    icon: '🩺',
  },
  {
    title: 'Laboratory (LIS)',
    description: 'Sample tracking, test ordering, results entry, quality control, and reporting.',
    icon: '🔬',
  },
  {
    title: 'Imaging/Radiology',
    description: 'PACS integration, image viewing, report generation, and modality worklist.',
    icon: '🩻',
  },
  {
    title: 'Pharmacy',
    description: 'Dispensing, prescription management, drug interaction checks, and stock control.',
    icon: '💊',
  },
  {
    title: 'Internal Messaging',
    description: 'Secure in-app communication between staff, departments, and care teams.',
    icon: '💬',
  },
  {
    title: 'Health Messaging (HL7)',
    description: 'Seamless integration with external systems, labs, and insurance via HL7 standards.',
    icon: '🔗',
  },
  {
    title: 'Reporting and Statistics',
    description: 'Advanced analytics, dashboards, KPI tracking, and custom reports with export options.',
    icon: '📊',
  },
];

export default function ProductsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-teal-900 py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-800 to-teal-950 opacity-90"></div>
        <div className="relative max-w-6xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl">
            CentralCore EMR Features
          </h1>
          <p className="text-2xl md:text-3xl mb-12 font-light max-w-4xl mx-auto drop-shadow-lg">
            A Complete Hospital Information System Built for Modern Healthcare Excellence
          </p>
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <a
              href="/buy"
              className="bg-yellow-400 text-teal-900 px-12 py-6 rounded-full text-2xl font-bold hover:bg-yellow-300 transition shadow-2xl"
            >
              Buy License Now
            </a>
            <a
              href="#features"
              className="bg-white/20 backdrop-blur-md text-white border-2 border-white px-12 py-6 rounded-full text-2xl font-bold hover:bg-white/30 transition shadow-2xl"
            >
              Explore All Features
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-teal-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black text-teal-900 text-center mb-16">
            Powerful Features for Every Department
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-xl p-10 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-teal-100"
              >
                <div className="text-6xl mb-6 text-center">{feature.icon}</div>
                <h3 className="text-3xl font-bold text-teal-900 mb-4 text-center">
                  {feature.title}
                </h3>
                <p className="text-lg text-gray-700 text-center leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CloudBeds Partner Badge */}
      <section className="py-20 px-6 bg-white text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-xl text-gray-700 mb-4">Proud Technology Partner</p>
          <div className="inline-flex items-center gap-4 bg-gray-100 px-8 py-4 rounded-full shadow-md border border-gray-200">
            <span className="text-3xl">🤝</span>
            <span className="text-2xl font-bold text-teal-900">CloudBeds Partner</span>
          </div>
        </div>
      </section>

      {/* CloudBeds Logo Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-4xl font-black text-teal-900 mb-10">Powered by Industry Leaders</h3>
          <div className="flex justify-center">
            <img
              src="/cloudbeds-logo.png"
              alt="CloudBeds Logo"
              className="h-20 opacity-90 hover:opacity-100 transition"
            />
          </div>
        </div>
      </section>

      {/* Hospitality Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black text-teal-900 mb-6">
            Now Serving Hotels & Hospitality
          </h2>
          <p className="text-2xl text-gray-700 max-w-4xl mx-auto mb-16 leading-relaxed">
            As an official <span className="font-bold text-teal-700">CloudBeds Partner</span>, 
            CentralCore now delivers world‑class property management, reservations, 
            guest experience automation, and hotel operations — all integrated seamlessly 
            with our powerful EMR ecosystem.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              {
                icon: '🏨',
                title: 'Property Management System (PMS)',
                description: 'Front desk operations, room assignments, housekeeping, and guest profiles powered by CloudBeds.',
              },
              {
                icon: '🛏️',
                title: 'Reservations & Booking Engine',
                description: 'Real‑time availability, channel manager sync, and direct booking tools for hotels and resorts.',
              },
              {
                icon: '📊',
                title: 'Hotel Analytics & Revenue',
                description: 'Smart pricing, occupancy forecasting, and revenue optimization dashboards.',
              },
              {
                icon: '🤝',
                title: 'Guest Experience Automation',
                description: 'Self‑check‑in, digital keys, automated messaging, and personalized guest journeys.',
              },
              {
                icon: '🧾',
                title: 'Billing & Invoicing',
                description: 'Integrated billing for rooms, services, POS, and hospitality packages.',
              },
              {
                icon: '🔗',
                title: 'CloudBeds Integration',
                description: 'Seamless data sync between CentralCore and CloudBeds for unified operations.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-teal-50 rounded-3xl shadow-lg p-10 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-teal-200"
              >
                <div className="text-6xl mb-6">{item.icon}</div>
                <h3 className="text-3xl font-bold text-teal-900 mb-4">{item.title}</h3>
                <p className="text-lg text-gray-700 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <a
              href="https://www.cloudbeds.com/pricing/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-teal-700 text-white px-16 py-6 rounded-full text-3xl font-bold hover:bg-teal-800 transition shadow-xl inline-block"
            >
              Explore Hospitality Solutions
            </a>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-6 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-black text-teal-900 text-center mb-16">
            Why CentralCore + CloudBeds?
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-3xl shadow-xl border border-gray-200">
              <thead>
                <tr className="bg-teal-800 text-white text-xl">
                  <th className="p-6 text-left">Feature</th>
                  <th className="p-6 text-left">CentralCore + CloudBeds</th>
                  <th className="p-6 text-left">Traditional Systems</th>
                </tr>
              </thead>
              <tbody className="text-lg">
                <tr className="border-b">
                  <td className="p-6">Unified Healthcare + Hospitality</td>
                  <td className="p-6 font-bold text-teal-700">Yes</td>
                  <td className="p-6 text-gray-500">No</td>
                </tr>
                <tr className="border-b">
                  <td className="p-6">CloudBeds PMS Integration</td>
                  <td className="p-6 font-bold text-teal-700">Yes</td>
                  <td className="p-6 text-gray-500">No</td>
                </tr>
                <tr className="border-b">
                  <td className="p-6">Real‑time Sync</td>
                  <td className="p-6 font-bold text-teal-700">Instant</td>
                  <td className="p-6 text-gray-500">Delayed</td>
                </tr>
                <tr className="border-b">
                  <td className="p-6">Guest + Patient Profiles</td>
                  <td className="p-6 font-bold text-teal-700">Unified</td>
                  <td className="p-6 text-gray-500">Separate</td>
                </tr>
                <tr>
                  <td className="p-6">Automation & AI</td>
                  <td className="p-6 font-bold text-teal-700">Advanced</td>
                  <td className="p-6 text-gray-500">Basic</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-center mt-16">
            <a
              href="/demo"
              className="bg-yellow-400 text-teal-900 px-16 py-6 rounded-full text-3xl font-bold hover:bg-yellow-300 transition shadow-xl inline-block"
            >
              Book a Demo for Hotels
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 bg-teal-800 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-16">
            Trusted by Leading Healthcare Providers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-teal-900/50 backdrop-blur-sm rounded-3xl p-10 border border-teal-700">
              <p className="text-xl mb-8 italic leading-relaxed">
                "CentralCore transformed our hospital operations. Patient care is faster, records are secure, and billing is seamless."
              </p>
              <p className="font-bold text-2xl text-yellow-400">
                Dr. Gbenga Adewale — Rivers State. Ultimate Specialist Hospital
              </p>
            </div>
            <div className="bg-teal-900/50 backdrop-blur-sm rounded-3xl p-10 border border-teal-700">
              <p className="text-xl mb-8 italic leading-relaxed">
                "The best EMR system we've used. Laboratory integration and reporting saved us hours every day."
              </p>
              <p className="font-bold text-2xl text-yellow-400">
                Prof. Dennies Alasia — Rivers State. Althahaus Medical Center
              </p>
            </div>
            <div className="bg-teal-900/50 backdrop-blur-sm rounded-3xl p-10 border border-teal-700">
              <p className="text-xl mb-8 italic leading-relaxed">
                "Ward management and pharmacy module are game-changers. Highly recommend CentralCore."
              </p>
              <p className="font-bold text-2xl text-yellow-400">
                Dr. Franca Ikimalo — Rivers State. Prime Medical Consultants
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-r from-teal-900 to-teal-800 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-8">
            Ready to Modernize Your Healthcare Facility?
          </h2>
          <p className="text-2xl mb-12 max-w-3xl mx-auto">
            Join hundreds of hospitals and clinics already using CentralCore EMR.
          </p>
          <a
            href="/buy"
            className="bg-yellow-400 text-teal-900 px-16 py-8 rounded-full text-3xl font-bold hover:bg-yellow-300 transition shadow-2xl inline-block"
          >
            Get Started Today
          </a>
        </div>
      </section>
    </>
  );
}

// app/products/page.tsx
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

export default function CuraCoreFeatures() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-32 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6">
            CuraCore EMR — The Complete Hospital Solution
          </h1>
          <p className="text-2xl mb-12 max-w-4xl mx-auto">
            Trusted by healthcare providers worldwide. Powerful, secure, and intuitive — designed for modern hospitals and clinics.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="/buy"
              className="bg-yellow-400 text-blue-900 px-10 py-5 rounded-full text-2xl font-bold hover:bg-yellow-300 transition"
            >
              Buy License Now
            </a>
            <a
              href="#features"
              className="bg-white text-blue-900 px-10 py-5 rounded-full text-2xl font-bold hover:bg-gray-100 transition"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-black text-blue-900 text-center mb-16">
            Powerful Features for Modern Healthcare
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-2xl p-10 hover:shadow-3xl hover:scale-105 transition-all duration-300"
              >
                <div className="text-6xl mb-6 text-center">{feature.icon}</div>
                <h3 className="text-3xl font-bold text-blue-900 mb-4 text-center">
                  {feature.title}
                </h3>
                <p className="text-lg text-gray-700 text-center">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-blue-900 text-white py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl font-black mb-16">
            Trusted by Healthcare Providers Worldwide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white/10 rounded-3xl p-10">
              <p className="text-xl mb-8 italic">
                "CuraCore transformed our hospital operations. Patient care is faster, records are secure, and billing is seamless."
              </p>
              <p className="font-bold text-2xl">Dr. Adebayo — Lagos University Teaching Hospital</p>
            </div>
            <div className="bg-white/10 rounded-3xl p-10">
              <p className="text-xl mb-8 italic">
                "The best EMR system we've used. Laboratory integration and reporting saved us hours every day."
              </p>
              <p className="font-bold text-2xl">Sister Mary — St. Nicholas Hospital</p>
            </div>
            <div className="bg-white/10 rounded-3xl p-10">
              <p className="text-xl mb-8 italic">
                "Ward management and pharmacy module are game-changers. Highly recommend CuraCore."
              </p>
              <p className="font-bold text-2xl">Dr. Fatima — Reddington Hospital</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-700 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-black mb-8">
            Ready to Transform Your Hospital?
          </h2>
          <p className="text-2xl mb-12">
            Join hundreds of healthcare providers using CuraCore EMR today.
          </p>
          <a
            href="/buy"
            className="bg-yellow-400 text-blue-900 px-12 py-6 rounded-full text-3xl font-bold hover:bg-yellow-300 transition inline-block"
          >
            Get Started Now
          </a>
        </div>
      </section>
    </div>
  );
}
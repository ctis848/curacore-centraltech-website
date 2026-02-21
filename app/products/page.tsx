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
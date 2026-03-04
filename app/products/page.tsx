import Link from "next/link";
import {
  Users,
  ClipboardList,
  FileText,
  FolderOpen,
  CalendarDays,
  Workflow,
  CreditCard,
  Boxes,
  BedDouble,
  Stethoscope,
  FlaskConical,
  ImageIcon,
  Pill,
  MessageSquare,
  Link2,
  BarChart3,
} from "lucide-react";

export const metadata = {
  title: "CentralCore EMR – Complete Hospital Information System Features",
  description:
    "Explore all CentralCore EMR modules including EMR, LIS, RIS, pharmacy, billing, inventory, wards, HL7, reporting, and more.",
};

const features = [
  {
    title: "Patients Management",
    description:
      "Register, track, and manage patient demographics, family records, and visit history with advanced search and filtering.",
    icon: <Users className="w-12 h-12 text-teal-700" />,
  },
  {
    title: "Medical Records",
    description:
      "Secure electronic health records with clinical notes, vitals, attachments, and a chronological timeline view.",
    icon: <ClipboardList className="w-12 h-12 text-teal-700" />,
  },
  {
    title: "Medical Forms",
    description:
      "Customizable digital forms, templates, and e‑signatures for consultations, consent, and assessments.",
    icon: <FileText className="w-12 h-12 text-teal-700" />,
  },
  {
    title: "Document Management",
    description:
      "Centralized storage for scans, reports, referrals, and certificates with version control and permissions.",
    icon: <FolderOpen className="w-12 h-12 text-teal-700" />,
  },
  {
    title: "Medical Scheduling",
    description:
      "Smart appointment booking, reminders, calendar sync, and waiting list management.",
    icon: <CalendarDays className="w-12 h-12 text-teal-700" />,
  },
  {
    title: "Medical Workflows",
    description:
      "Automated clinical pathways, task assignments, approvals, and protocol enforcement.",
    icon: <Workflow className="w-12 h-12 text-teal-700" />,
  },
  {
    title: "Medical Billing & Claims",
    description:
      "Integrated billing, insurance claims, invoicing, and payment tracking with audit trails.",
    icon: <CreditCard className="w-12 h-12 text-teal-700" />,
  },
  {
    title: "Inventory Management",
    description:
      "Real‑time tracking of drugs, consumables, and equipment with low‑stock alerts and expiry monitoring.",
    icon: <Boxes className="w-12 h-12 text-teal-700" />,
  },
  {
    title: "Wards Management",
    description:
      "Bed allocation, admissions, discharges, ward rounds, and patient monitoring dashboards.",
    icon: <BedDouble className="w-12 h-12 text-teal-700" />,
  },
  {
    title: "Nurses Module",
    description:
      "Nursing notes, vitals charting, medication administration, and care plan management.",
    icon: <Stethoscope className="w-12 h-12 text-teal-700" />,
  },
  {
    title: "Laboratory (LIS)",
    description:
      "Sample tracking, test ordering, results entry, quality control, and automated reporting.",
    icon: <FlaskConical className="w-12 h-12 text-teal-700" />,
  },
  {
    title: "Imaging / Radiology",
    description:
      "PACS integration, DICOM viewing, radiology reporting, and modality worklist support.",
    icon: <ImageIcon className="w-12 h-12 text-teal-700" />,
  },
  {
    title: "Pharmacy",
    description:
      "Dispensing, prescription management, drug interaction checks, and stock control.",
    icon: <Pill className="w-12 h-12 text-teal-700" />,
  },
  {
    title: "Internal Messaging",
    description:
      "Secure communication between staff, departments, and care teams with message history.",
    icon: <MessageSquare className="w-12 h-12 text-teal-700" />,
  },
  {
    title: "Health Messaging (HL7)",
    description:
      "Seamless integration with labs, insurance, and external systems using HL7 standards.",
    icon: <Link2 className="w-12 h-12 text-teal-700" />,
  },
  {
    title: "Reporting & Statistics",
    description:
      "Advanced analytics, dashboards, KPIs, and customizable reports with export options.",
    icon: <BarChart3 className="w-12 h-12 text-teal-700" />,
  },
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">

      {/* Breadcrumbs */}
      <nav className="px-6 py-4 text-sm text-gray-600">
        <Link href="/" className="hover:text-teal-700">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-teal-700 font-semibold">Products</span>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-teal-900 py-24 sm:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-800 to-teal-950 opacity-90"></div>

        <div className="relative max-w-6xl mx-auto text-center text-white">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 drop-shadow-2xl leading-tight">
            CentralCore EMR Features
          </h1>

          <p className="text-base sm:text-xl md:text-3xl mb-10 sm:mb-12 font-light max-w-3xl mx-auto drop-shadow-lg leading-relaxed">
            A complete hospital information system built for modern healthcare excellence.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/buy"
              className="bg-yellow-400 text-teal-900 px-8 py-4 sm:px-12 sm:py-6 rounded-full text-lg sm:text-2xl font-bold hover:bg-yellow-300 transition shadow-2xl"
            >
              Buy License Now
            </Link>

            <a
              href="#features"
              className="bg-white/20 backdrop-blur-md text-white border-2 border-white px-8 py-4 sm:px-12 sm:py-6 rounded-full text-lg sm:text-2xl font-bold hover:bg-white/30 transition shadow-2xl"
            >
              Explore All Features
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 sm:py-24 px-6 bg-teal-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-teal-900 text-center mb-12 sm:mb-16 leading-tight">
            Powerful Features for Every Department
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-teal-100"
              >
                <div className="flex justify-center mb-6">{feature.icon}</div>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-900 mb-3 text-center">
                  {feature.title}
                </h3>

                <p className="text-sm sm:text-base md:text-lg text-gray-700 text-center leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 px-6 bg-gradient-to-r from-teal-900 to-teal-800 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-6 sm:mb-8 leading-tight">
            Ready to Modernize Your Healthcare Facility?
          </h2>

          <p className="text-base sm:text-xl md:text-2xl mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
            Join hundreds of hospitals and clinics already using CentralCore EMR.
          </p>

          <Link
            href="/buy"
            className="bg-yellow-400 text-teal-900 px-10 py-4 sm:px-16 sm:py-8 rounded-full text-xl sm:text-3xl font-bold hover:bg-yellow-300 transition shadow-2xl inline-block"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
}

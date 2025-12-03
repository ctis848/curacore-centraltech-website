// app/products/page.tsx
import Navbar from '@/components/Navbar';

const services = [
  "EMR Software CuraCore",
  "POS Software",
  "Nurses Call Bell",
  "IP Intercom Phones",
  "Fire Alarm System & Fibre Optic Solutions",
  "Custom Desktop/Web/Mobile Applications",
  "Automated Security Gate System",
  "CCTV Security Systems",
  "Data Centre Expert Services"
];

export default function Products() {
  return (
    <>
      <main className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold text-center mb-12">Our Products & Services</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition">
                <h3 className="text-2xl font-bold mb-4 text-blue-900">{service}</h3>
                <button className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition">
                  Request Quote
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
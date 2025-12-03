// app/page.tsx
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 px-4">
        <section className="bg-blue-900 text-white py-24">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to Central Tech Information Systems
            </h1>
            <p className="text-xl md:text-2xl mb-10">
              Global Leader in Healthcare & Enterprise Technology Solutions
            </p>
            <div className="space-x-4">
              <a href="/curacore" className="bg-white text-blue-900 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition">
                Explore CuraCore EMR
              </a>
              <a href="/products" className="border-2 border-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-white hover:text-blue-900 transition">
                View All Products
              </a>
            </div>
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-10">Trusted by Healthcare Providers Worldwide</h2>
            <p className="text-xl text-gray-700">Your success is our mission.</p>
          </div>
        </section>
      </main>
    </>
  );
}
// app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 text-white">
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 text-center">
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          Welcome to Central Tech<br />Information Systems
        </h1>
        <p className="text-xl md:text-3xl mb-12 opacity-90">
          Global Leader in Healthcare & Enterprise Technology Solutions
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link href="/curacore" className="bg-white text-blue-900 px-10 py-5 rounded-full text-xl font-bold hover:bg-gray-100 transition">
            Explore CuraCore EMR
          </Link>
          <Link href="/buy" className="border-4 border-white px-10 py-5 rounded-full text-xl font-bold hover:bg-white hover:text-blue-900 transition">
            Buy License Now
          </Link>
        </div>
      </div>

      <div className="bg-white text-blue-900 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-black">
            Trusted by Healthcare Providers Worldwide
          </h2>
        </div>
      </div>
    </div>
  );
}
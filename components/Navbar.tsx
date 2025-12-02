// components/Navbar.tsx
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold tracking-wider">
              Central Tech Information Systems
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-blue-300 transition">Home</Link>
            <Link href="/products" className="hover:text-blue-300 transition">Products & Services</Link>
            <Link href="/curacore" className="hover:text-blue-300 transition">CuraCore EMR</Link>
            <Link href="/portal/login" className="bg-white text-blue-900 px-5 py-2 rounded font-semibold hover:bg-gray-100 transition">
              Client Portal
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button className="mobile-menu-button">☰</button>
          </div>
        </div>
      </div>

      {/* Mobile menu (simple version for now) */}
      <div className="md:hidden hidden mobile-menu">
        <Link href="/" className="block px-4 py-2 hover:bg-blue-800">Home</Link>
        <Link href="/products" className="block px-4 py-2 hover:bg-blue-800">Products & Services</Link>
        <Link href="/curacore" className="block px-4 py-2 hover:bg-blue-800">CuraCore EMR</Link>
        <Link href="/portal/login" className="block px-4 py-2 bg-white text-blue-900 font-bold">Client Portal</Link>
      </div>
    </nav>
  );
}
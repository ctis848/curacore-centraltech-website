import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-teal-900 text-white py-10 mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        <div>
          <h3 className="text-xl font-bold mb-3">CentralCore EMR</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            A complete electronic medical record system designed for modern hospitals.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Products</h3>
          <ul className="space-y-2 text-gray-300">
            <li><Link href="/centralcore">CentralCore EMR</Link></li>
            <li><Link href="/nurse-call">Nurse Call System</Link></li>
            <li><Link href="/digital-signage">Digital Signage</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Company</h3>
          <ul className="space-y-2 text-gray-300">
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Legal</h3>
          <ul className="space-y-2 text-gray-300">
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
          </ul>
        </div>

      </div>

      <div className="text-center text-gray-400 text-sm mt-10">
        © {new Date().getFullYear()} Central Tech Information Systems Ltd.
      </div>
    </footer>
  );
}

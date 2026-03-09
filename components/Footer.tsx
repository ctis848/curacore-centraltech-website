export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">

        <div>
          <h2 className="text-xl font-bold text-white">CentralCore EMR</h2>
          <p className="mt-3 text-gray-400">
            A complete electronic medical record system for modern healthcare.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Quick Links</h3>
          <ul className="mt-3 space-y-2">
            <li><a href="/features" className="hover:text-white">Features</a></li>
            <li><a href="/services" className="hover:text-white">Services</a></li>
            <li><a href="/resources" className="hover:text-white">Resources</a></li>
            <li><a href="/pricing" className="hover:text-white">Pricing</a></li>
            <li><a href="/download" className="hover:text-white">Download</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Contact</h3>
          <p className="mt-3 text-gray-400">support@ctisetech.com</p>
          <p className="text-gray-400">+234 (000) 000‑0000</p>
        </div>

      </div>

      <div className="text-center text-gray-500 mt-10">
        © {new Date().getFullYear()} CentralCore EMR. All rights reserved.
      </div>
    </footer>
  );
}

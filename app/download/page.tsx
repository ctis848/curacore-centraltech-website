export default function DownloadPage() {
  return (
    <section className="bg-gray-950 text-gray-200 py-24">
      <div className="max-w-5xl mx-auto px-6 text-center">

        <h1 className="text-4xl font-bold text-white">Download CentralCore EMR</h1>
        <p className="mt-4 text-gray-400 max-w-xl mx-auto">
          Install the desktop application for secure, offline‑capable medical record management.
        </p>

        <div className="mt-12 flex flex-col md:flex-row justify-center gap-6">
          <a className="px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold transition">
            Windows Installer (.exe)
          </a>
          <a className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg font-semibold transition">
            macOS Installer (.dmg)
          </a>
          <a className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg font-semibold transition">
            Linux (.AppImage)
          </a>
        </div>

        <p className="mt-10 text-gray-500 text-sm">
          Secure • Encrypted • HIPAA‑ready • Offline‑capable
        </p>

      </div>
    </section>
  );
}

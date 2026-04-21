import Link from "next/link";

export default function DownloadSuccess() {
  return (
    <section className="bg-gray-950 text-gray-200 py-24 text-center">
      <h1 className="text-4xl font-bold text-white">Download Started</h1>
      <p className="mt-4 text-gray-400 max-w-xl mx-auto">
        Your download has begun. If it doesn’t start automatically, please try again.
      </p>

      <Link
        href="/"
        className="inline-block mt-10 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold transition"
      >
        ← Return to Home
      </Link>
    </section>
  );
}

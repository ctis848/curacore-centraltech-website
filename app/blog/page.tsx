// app/blog/page.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function BlogPage() {
  return (
    <>
      {/* Hero with EMR Interface Background */}
      <section className="relative h-screen w-full">
        <Image
          src="/blog-hero.jpg"
          alt="Modern EMR software interface on computer screen"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-teal-900/70" />

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-6">
          <h1 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl">
            CuraCore Blog
          </h1>
          <p className="text-2xl md:text-4xl mb-12 font-light max-w-4xl drop-shadow-lg">
            Insights, Tips & Updates from Healthcare IT Experts
          </p>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-24 px-6 bg-teal-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-black text-teal-900 mb-12">
            Blog Coming Soon
          </h2>
          <p className="text-2xl text-gray-700 mb-16 leading-relaxed">
            Stay tuned for expert articles on EMR best practices, Nigerian healthcare digitalization, patient data security, offline EMR tips, and success stories from hospitals using CuraCore.
          </p>
          <p className="text-xl text-gray-600 mb-20">
            Topics include: Going Paperless, Training Your Staff, Regulatory Compliance, and more.
          </p>
          <Link
            href="/contact"
            className="bg-yellow-400 text-teal-900 px-16 py-8 rounded-full text-3xl font-bold hover:bg-yellow-300 transition shadow-2xl inline-block"
          >
            Get Notified When We Launch
          </Link>
        </div>
      </section>
    </>
  );
}
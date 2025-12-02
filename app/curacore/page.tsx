// app/curacore/page.tsx
import Navbar from '@/components/Navbar';

export default function CuraCore() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-24">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">CuraCore EMR Software</h1>
            <p className="text-2xl mb-10">Offline-First • Secure • Lifetime License Available</p>
            <a href="#" className="bg-green-500 text-white px-10 py-5 rounded-xl text-2xl font-bold hover:bg-green-600 transition inline-block">
              Download CuraCore (Demo + Full Version)
            </a>
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="bg-white p-10 rounded-xl shadow-xl text-center">
                <h3 className="text-3xl font-bold text-blue-900">Starter</h3>
                <p className="text-5xl font-bold my-6">$11<span className="text-xl">/month</span></p>
                <p className="text-gray-600">Max 5 users</p>
                <button className="mt-8 bg-blue-900 text-white px-8 py-4 rounded-lg text-xl font-bold w-full hover:bg-blue-800 transition">Buy Now</button>
              </div>

              <div className="bg-blue-900 text-white p-10 rounded-xl shadow-2xl transform scale-105">
                <h3 className="text-3xl font-bold">Pro</h3>
                <p className="text-5xl font-bold my-6">$15<span className="text-xl">/month</span></p>
                <p>Max 25 users • Most Popular</p>
                <button className="mt-8 bg-white text-blue-900 px-8 py-4 rounded-lg text-xl font-bold w-full hover:bg-gray-100 transition">Buy Now</button>
              </div>

              <div className="bg-white p-10 rounded-xl shadow-xl text-center">
                <h3 className="text-3xl font-bold text-blue-900">Enterprise</h3>
                <p className="text-5xl font-bold my-6">$399<span className="text-xl"> lifetime</span></p>
                <p className="text-gray-600">+15% annual service fee</p>
                <button className="mt-8 bg-blue-900 text-white px-8 py-4 rounded-lg text-xl font-bold w-full hover:bg-blue-800 transition">Buy Now</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
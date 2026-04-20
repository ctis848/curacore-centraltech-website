// components/Testimonials.tsx  (or directly in your home page)
export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "CentralCore transformed our hospital operations. Patient care is faster, records are secure, and billing is seamless.",
      name: "Dr. Gbenga Adewale",
      subtitle: "Rivers State — Ultimate Specialist Hospital",
    },
    {
      quote:
        "The best EMR system we've used. Laboratory integration and reporting saved us hours every day.",
      name: "Prof. Dennies Alasia",
      subtitle: "Rivers State — Althahaus Medical Center",
    },
    {
      quote:
        "Ward management and pharmacy module are game-changers. Highly recommend CentralCore.",
      name: "Dr. Franca Ikimalo",
      subtitle: "Rivers State — Prime Medical Consultants",
    },
  ];

  return (
    <section className="py-24 px-6 bg-teal-800 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black mb-4">
            Trusted by Leading Healthcare Providers
          </h2>
          <p className="text-teal-100 text-lg max-w-2xl mx-auto">
            Real stories from hospitals and clinics using CentralCore across Rivers State and beyond.
          </p>
        </div>

        {/* Static Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-teal-900/50 backdrop-blur-xl border border-teal-500/30 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-6xl text-teal-400 mb-6">“</div>

              <p className="text-lg leading-relaxed mb-8 italic text-teal-100">
                {testimonial.quote}
              </p>

              <div>
                <p className="font-bold text-xl text-white">
                  {testimonial.name}
                </p>
                <p className="text-teal-200 text-sm mt-1">
                  {testimonial.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-teal-200 mt-12 text-sm">
          Join over 50+ healthcare facilities using CentralCore
        </p>
      </div>
    </section>
  );
}
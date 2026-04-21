// components/Testimonials.tsx
export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "CentralCore transformed our hospital operations. Patient care is faster, records are secure, and billing is seamless.",
      name: "Dr. Gbenga Adewale",
      subtitle: "Rivers State. Ultimate Specialist Hospital",
    },
    {
      quote:
        "The best EMR system we've used. Laboratory integration and reporting saved us hours every day.",
      name: "Prof. Dennies Alasia",
      subtitle: "Rivers State. Althahaus Medical Center",
    },
    {
      quote:
        "Ward management and pharmacy module are game-changers. Highly recommend CentralCore.",
      name: "Dr. Franca Ikimalo",
      subtitle: "Rivers State. Prime Medical Consultants",
    },
  ];

  return (
    <section className="py-24 px-6 bg-teal-800 text-white">
      <div className="max-w-6xl mx-auto text-center">

        {/* Heading */}
        <h2 className="text-5xl md:text-6xl font-black mb-16">
          Trusted by Leading Healthcare Providers
        </h2>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="bg-teal-900/50 backdrop-blur-sm rounded-3xl p-10 border border-teal-700 shadow-xl"
            >
              <p className="text-xl mb-8 italic leading-relaxed">
                "{t.quote}"
              </p>

              <p className="font-bold text-2xl text-yellow-400">
                {t.name}
              </p>

              <p className="text-white text-lg mt-2">
                {t.subtitle}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

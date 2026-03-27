"use client";

import { useEffect, useRef, useState } from "react";

type Testimonial = {
  quote: string;
  name: string;
  subtitle: string;
};

const testimonials: Testimonial[] = [
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

export default function EnhancedTestimonials() {
  const [index, setIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef(0);

  // Auto-rotate
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Swipe handlers
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const diff = touchStartX.current - endX;
      if (diff > 50) setIndex((prev) => (prev + 1) % testimonials.length);
      if (diff < -50)
        setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    el.addEventListener("touchstart", handleTouchStart);
    el.addEventListener("touchend", handleTouchEnd);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const current = testimonials[index];

  return (
    <section className="relative py-24 px-6 bg-teal-800 text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-10 right-10 w-56 h-56 bg-yellow-400/10 rounded-full blur-3xl animate-float-slower" />
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <h2 className="text-5xl md:text-6xl font-black mb-16 animate-fade-in">
          Trusted by Leading Healthcare Providers
        </h2>

        {/* Carousel */}
        <div ref={carouselRef} className="relative max-w-3xl mx-auto">
          <div
            ref={cardRef}
            className="relative bg-teal-900/40 backdrop-blur-xl rounded-3xl p-10 border border-teal-500/40 shadow-2xl transition-transform duration-200 overflow-hidden group"
          >
            <div className="text-left">
              <p className="text-xl mb-6 italic leading-relaxed">
                “{current.quote}”
              </p>
              <p className="font-bold text-2xl text-yellow-400">
                {current.name}
              </p>
              <p className="text-sm text-teal-100 mt-1">
                {current.subtitle}
              </p>
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center mt-8 gap-3">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === index ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Infinite marquee */}
        <div className="mt-16 overflow-hidden">
          <div className="flex gap-10 animate-marquee whitespace-nowrap">
            {testimonials.concat(testimonials).map((t, i) => (
              <div key={i} className="inline-flex items-center gap-3 text-sm text-teal-100">
                <span className="w-6 h-6 rounded-full bg-teal-500/60 flex items-center justify-center text-xs font-bold">
                  {t.name.split(" ")[1]?.[0] ?? t.name[0]}
                </span>
                <span className="opacity-80">
                  “{t.quote.slice(0, 70)}…”
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

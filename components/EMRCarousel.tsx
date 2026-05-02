"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const images = [
  { src: "/emr-1.jpg", alt: "CentralCore EMR Dashboard" },
  { src: "/emr-2.jpg", alt: "CentralCore EMR Interface" },
];

export default function EMRCarousel() {
  const [index, setIndex] = useState(0);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Image container */}
      <div className="overflow-hidden rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        {images.map((img, i) => (
          <div
            key={i}
            className={`transition-opacity duration-700 ease-in-out ${
              i === index ? "opacity-100" : "opacity-0 absolute inset-0"
            }`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={1600}
              height={900}
              className="w-full h-auto object-cover"
            />
          </div>
        ))}
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center mt-6 space-x-3">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-4 h-4 rounded-full transition-all ${
              i === index
                ? "bg-teal-600 scale-110"
                : "bg-gray-400 dark:bg-gray-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PromoPopup() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show on homepage
    if (pathname !== "/") return;

    const hasSeenPopup = localStorage.getItem("promo_popup_seen");
    if (!hasSeenPopup) {
      setTimeout(() => setShow(true), 800);
    }
  }, [pathname]);

  const closePopup = () => {
    localStorage.setItem("promo_popup_seen", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-lg rounded-2xl shadow-2xl p-8 text-center animate-fade-in">
        
        <h2 className="text-3xl font-bold text-purple-700 mb-4">
          Welcome to CentralTech!
        </h2>

        <p className="text-gray-700 text-lg mb-6">
          Get access to our premium IT services, on‑site support, software
          solutions, and exclusive updates. Join our community today.
        </p>

        <button
          onClick={() => (window.location.href = "/auth/client/signup")}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-semibold rounded-xl shadow-lg hover:scale-[1.02] transition-all mb-4"
        >
          Sign Up Now
        </button>

        <button
          onClick={closePopup}
          className="text-gray-600 hover:text-gray-900 text-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}

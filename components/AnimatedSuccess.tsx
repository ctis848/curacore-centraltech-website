"use client";

export default function AnimatedSuccess() {
  return (
    <div className="flex flex-col items-center justify-center mb-6">
      {/* Circle Animation */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-ping"></div>

        <div className="absolute inset-0 rounded-full border-4 border-emerald-600 animate-pulse"></div>

        <div className="absolute inset-0 rounded-full bg-emerald-600 flex items-center justify-center shadow-xl">
          <svg
            className="w-12 h-12 text-white animate-[bounce_0.6s_ease-out]"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* Glow */}
      <div className="mt-4 w-32 h-2 bg-emerald-300 rounded-full blur-md opacity-70 animate-pulse"></div>
    </div>
  );
}

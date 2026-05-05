"use client";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/2348059318564?text=Hello%20CTIS%2C%20I%20need%20assistance%20with%20CentralCore%20EMR"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="
        fixed bottom-6 right-6 z-50
        bg-green-500 hover:bg-green-600
        text-white p-4 rounded-full shadow-xl
        transition-all duration-300
        flex items-center justify-center
        animate-[pulse_2s_infinite]
      "
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="white"
        viewBox="0 0 24 24"
        width="32"
        height="32"
      >
        <path d="M20.52 3.48A11.8 11.8 0 0 0 12 0C5.37 0 0 5.37 0 12a11.9 11.9 0 0 0 1.64 6L0 24l6.26-1.64A12 12 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 21.6c-1.92 0-3.79-.52-5.42-1.52l-.39-.23-3.72.98.99-3.63-.25-.38A9.6 9.6 0 0 1 2.4 12c0-5.28 4.32-9.6 9.6-9.6 2.56 0 4.96 1 6.77 2.81A9.5 9.5 0 0 1 21.6 12c0 5.28-4.32 9.6-9.6 9.6zm5.04-7.2c-.28-.14-1.65-.81-1.9-.9-.25-.1-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.43-2.25-1.38-.83-.74-1.38-1.65-1.54-1.93-.16-.28-.02-.43.12-.57.12-.12.28-.32.43-.48.14-.16.18-.28.28-.46.1-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.02-.22-.53-.45-.46-.61-.46h-.52c-.18 0-.48.07-.73.34-.25.28-.96.94-.96 2.28 0 1.34.98 2.63 1.12 2.81.14.18 1.93 2.95 4.68 4.14 2.75 1.19 2.75.79 3.25.74.5-.05 1.65-.67 1.89-1.32.24-.65.24-1.21.17-1.32-.07-.11-.25-.18-.53-.32z" />
      </svg>
    </a>
  );
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// Define allowed languages
type Language = "en" | "yo" | "ha" | "ig";

// Strongly typed messages object
const messages: Record<
  Language,
  {
    welcome: string;
    help: string;
    typing: string;
    faq: string[];
  }
> = {
  en: {
    welcome: "Hello! Welcome to CTIS Support.",
    help: "How can we assist you today?",
    typing: "CTIS is typing...",
    faq: [
      "Buy a License",
      "Request Support",
      "Book a Demo",
      "Ask About Pricing",
      "Integration Questions",
    ],
  },
  yo: {
    welcome: "Ẹ káàbọ̀ sí CTIS Support.",
    help: "Báwo ni a ṣe lè ràn ẹ lọ́wọ́ lónìí?",
    typing: "CTIS ń kọ̀wé...",
    faq: [
      "Ra Laisensi",
      "Beere Iranlọwọ",
      "Pèsè Àfihàn",
      "Beere Nípa Owo",
      "Ìbéèrè Integration",
    ],
  },
  ha: {
    welcome: "Barka da zuwa CTIS Support.",
    help: "Ta yaya zamu iya taimaka maka yau?",
    typing: "CTIS na rubutu...",
    faq: [
      "Sayi Lasisi",
      "Nemi Tallafi",
      "Nemi Demo",
      "Tambayi Farashi",
      "Tambayoyin Haɗawa",
    ],
  },
  ig: {
    welcome: "Nnọọ na CTIS Support.",
    help: "Kedu ka anyị ga-esi nyere gị taa?",
    typing: "CTIS na-ede…",
    faq: [
      "Zụta License",
      "Arịrịọ Nkwado",
      "Bukọọ Demo",
      "Jụọ Maka Ọnụahịa",
      "Ajụjụ Njikọ",
    ],
  },
};

export default function ChatButton() {
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [status, setStatus] = useState<"checking" | "online" | "offline">(
    "checking"
  );
  const [language, setLanguage] = useState<Language>("en");
  const [file, setFile] = useState<File | null>(null);

  // Fake typing animation
  useEffect(() => {
    if (open) {
      setTyping(true);
      const timer = setTimeout(() => setTyping(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Fake WhatsApp API status
  useEffect(() => {
    setTimeout(() => setStatus("online"), 1200);
  }, []);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) setFile(uploaded);
  };

  const sendFileToWhatsApp = () => {
    if (!file) return;
    const text = encodeURIComponent(`I am sending a file: ${file.name}`);
    window.open(`https://wa.me/2348012345678?text=${text}`, "_blank");
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50 group">
        {/* Tooltip */}
        <div className="absolute right-20 bottom-1 bg-black dark:bg-white text-white dark:text-black text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="CTIS"
            width={20}
            height={20}
            className="rounded-full"
          />
          <span>Chat with CTIS</span>
        </div>

        {/* Pulse */}
        <div className="absolute inset-0 rounded-full bg-green-500 opacity-40 animate-ping"></div>

        {/* Button */}
        <button
          onClick={() => setOpen(true)}
          className="relative flex items-center justify-center w-16 h-16 bg-green-500 dark:bg-green-600 rounded-full shadow-xl hover:bg-green-600 dark:hover:bg-green-700 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="34"
            height="34"
            fill="white"
            viewBox="0 0 24 24"
          >
            <path d="M20.52 3.48A11.8 11.8 0 0 0 12 0C5.37 0 0 5.37 0 12a11.9 11.9 0 0 0 1.64 6L0 24l6.26-1.64A11.9 11.9 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52z" />
          </svg>
        </button>
      </div>

      {/* Drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="fixed bottom-0 right-0 left-0 md:right-6 md:left-auto md:w-96 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl p-6 z-50 animate-slideUp">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="CTIS"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="font-bold text-lg text-gray-900 dark:text-white">
                    CTIS Support
                  </p>
                  <p
                    className={`text-sm ${
                      status === "online"
                        ? "text-green-500"
                        : status === "offline"
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {status === "checking"
                      ? "Checking..."
                      : status === "online"
                      ? "Online"
                      : "Offline"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full mb-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              <option value="en">English</option>
              <option value="yo">Yoruba</option>
              <option value="ha">Hausa</option>
              <option value="ig">Igbo</option>
            </select>

            {/* Chatbot Welcome */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl mb-4">
              <p className="text-gray-800 dark:text-gray-200 font-medium">
                👋 {messages[language].welcome}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {messages[language].help}
              </p>
            </div>

            {/* Typing Indicator */}
            {typing && (
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce delay-300"></div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {messages[language].typing}
                </span>
              </div>
            )}

            {/* FAQ Quick Replies */}
            <div className="space-y-3 mb-6">
              {messages[language].faq.map((q: string, i: number) => (
                <button
                  key={i}
                  onClick={() =>
                    window.open(
                      `https://wa.me/2348012345678?text=${encodeURIComponent(
                        q
                      )}`,
                      "_blank"
                    )
                  }
                  className="w-full text-left px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Send us a file
              </label>
              <input
                type="file"
                onChange={handleFileUpload}
                className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
              />
              {file && (
                <button
                  onClick={sendFileToWhatsApp}
                  className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                >
                  Send File via WhatsApp
                </button>
              )}
            </div>

            {/* WhatsApp Button */}
            <a
              href="https://wa.me/2348059318564"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-500 hover:bg-green-600 text-white text-center py-3 rounded-xl font-semibold transition"
            >
              Open WhatsApp Chat
            </a>
          </div>
        </>
      )}

      {/* Animation */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.35s ease-out;
        }
      `}</style>
    </>
  );
}

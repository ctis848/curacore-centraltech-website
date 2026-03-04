import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatButton from "@/components/ChatButton";
import SupabaseProvider from "@/components/SupabaseProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CentralCore EMR - Complete Hospital Information System",
  description:
    "CentralCore EMR by Central Tech Information Systems Ltd. — A powerful, secure, and intuitive Electronic Medical Record system.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <SupabaseProvider>
          <Navbar />

          <main className="min-h-screen">
            {children}
          </main>

          <Footer />

          {/* WhatsApp Floating Chat Button */}
          <a
            href="https://wa.me/2348059318564"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-xl hover:bg-green-600 transition z-50"
          >
            💬
          </a>

          {/* Existing ChatButton Component (Optional) */}
          <ChatButton />
        </SupabaseProvider>
      </body>
    </html>
  );
}

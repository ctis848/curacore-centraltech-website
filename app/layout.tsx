// app/layout.tsx
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
          <ChatButton />
        </SupabaseProvider>
      </body>
    </html>
  );
}

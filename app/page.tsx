import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "CentralCore EMR",
  description: "Central Tech Information Systems Ltd.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </head>

      <body className="min-h-screen w-full overflow-x-hidden bg-gray-50 text-gray-900 antialiased pb-safe">
        <Navbar />
        <main className="flex-1 w-full max-w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

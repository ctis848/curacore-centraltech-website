// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CuraCore – Central Tech Information Systems',
  description: 'The #1 Offline Hospital Management System in Nigeria',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        <Navbar />
        <main className="pt-16 md:pt-20 min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatButton from '@/components/ChatButton';  // <-- New import

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CuraCore EMR',
  description: 'A Complete Electronic Medical Record System for Modern Healthcare',
  keywords: 'EMR, EHR, hospital software, medical records, healthcare Nigeria',
  openGraph: {
    title: 'CuraCore EMR',
    description: 'The #1 Hospital Information System in Africa',
    url: 'https://curacore-centraltech-website.netlify.app',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-teal-50 text-gray-900 antialiased relative`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ChatButton />  {/* Floating 24/7 Live Chat button on all pages */}
      </body>
    </html>
  );
}
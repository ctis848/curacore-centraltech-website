// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatButton from '@/components/ChatButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CentralCore EMR - Complete Hospital Information System',
  description: 'CentralCore EMR by Central Tech Information Systems Ltd. — A powerful, secure, and intuitive Electronic Medical Record system designed for modern healthcare facilities in Nigeria and worldwide.',
  keywords: 'EMR, EHR, hospital software, medical records, healthcare IT, Nigeria, CentralCore, Central Tech Information Systems',
  openGraph: {
    title: 'CentralCore EMR',
    description: 'The leading Hospital Information System by Central Tech Information Systems Ltd.',
    url: 'https://centraltechis.com',
    type: 'website',
    siteName: 'CentralCore EMR',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'CTIS Technologies Logo',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={`${inter.className} bg-teal-50 text-gray-900 antialiased relative`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ChatButton />
      </body>
    </html>
  );
}
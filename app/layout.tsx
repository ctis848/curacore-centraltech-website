// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CuraCore – Central Tech Information Systems',
  description: 'Global Leader in Healthcare & Enterprise Technology Solutions',
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
      </body>
    </html>
  );
}
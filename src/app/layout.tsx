import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import Navigation from '@/components/Navigation';
import FloatingDock from '@/components/FloatingDock';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Master Plumbing Study | Exam Preparation',
  description: 'Personal study website for Master Plumbing exam preparation with interactive flashcards, progress tracking, and exam-focused content.',
  keywords: ['master plumbing', 'plumbing exam', 'study', 'flashcards', 'plumbing code'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#052e16" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body>
        <AuthProvider>
          <div className="flex flex-col min-h-screen pb-24">
            <Navigation />
            <main className="container py-8 flex-grow relative">
              {children}
            </main>
            <FloatingDock />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

import './globals.css';
import type { Metadata } from 'next';
import { NeynarProvider } from '@/lib/neynar';

export const metadata: Metadata = {
  title: 'Missing Operation',
  description: 'Farcaster Math Puzzle Mini-App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-white">
        <NeynarProvider>
          <div className="max-w-4xl mx-auto px-4 py-8">
            {children}
          </div>
        </NeynarProvider>
      </body>
    </html>
  );
}

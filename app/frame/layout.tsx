import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Missing Operation - Farcaster Frame',
  description: 'Solve math puzzles in Farcaster Frames',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    images: [
      {
        url: '/images/opengraph-frame.png',
        width: 800,
        height: 600,
        alt: 'Math Puzzle Frame',
      },
    ],
  },
};

export default function FrameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

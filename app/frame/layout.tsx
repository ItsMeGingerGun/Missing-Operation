export const metadata = {
  title: 'Missing Operation - Farcaster Frame',
  description: 'Solve math puzzles in Farcaster Frames',
};

export default function FrameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900">
        {children}
      </body>
    </html>
  );
}

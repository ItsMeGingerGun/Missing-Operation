import Link from 'next/link';

export default function FrameNav() {
  return (
    <div className="fixed bottom-4 right-4">
      <Link 
        href="/frame"
        className="bg-farcaster-purple text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
      >
        <span>Open Frame</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
        </svg>
      </Link>
    </div>
  );
}

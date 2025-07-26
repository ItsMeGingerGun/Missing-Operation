'use client';
import * as frame from '@farcaster/frame-sdk';
import { useEffect, useState } from 'react';
import { generateFramePuzzle, FRAME_SAMPLE_PUZZLES } from '@/lib/puzzle';
import { redis, storeFramePuzzle } from '@/lib/redis';
import { useRouter } from 'next/navigation';
import type { Puzzle } from '@/types';

export default function FramePage() {
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

export default function FramePage() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<{correct: boolean, solution: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fid, setFid] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initializeFrame = async () => {
      try {
        // Initialize Frame SDK
        await frame.sdk.actions.ready();
        
        // Get Farcaster context
        const context = await frame.sdk.context();
        
        if (context.isValid && context.user) {
          setFid(context.user.fid.toString());
        } else {
          console.warn('No valid Farcaster context found. Using demo mode.');
        }
        
        // Generate a puzzle
        const puzzle = generateFramePuzzle();
        
        // Store puzzle in Redis
        await storeFramePuzzle(puzzle);
        setPuzzle(puzzle);
        setIsLoading(false);
        
      } catch (error) {
        console.error('Frame initialization failed:', error);
        setError('Failed to initialize frame. Trying demo puzzle...');
        
        // Fallback to sample puzzle
        const sample = FRAME_SAMPLE_PUZZLES[
          Math.floor(Math.random() * FRAME_SAMPLE_PUZZLES.length)
        ];
        setPuzzle(sample);
        setIsLoading(false);
      }
    };

    initializeFrame();
  }, []);

  const handleAnswer = async (answer: string | number) => {
    if (!puzzle) return;
    
    let correct = false;
    if (puzzle.type === 'Calculation') {
      correct = Math.abs(puzzle.solution - Number(answer)) < 0.001;
    } else {
      correct = puzzle.solution === answer;
    }
    
    setResult({
      correct,
      solution: puzzle.solution.toString()
    });
    
    // Track analytics if we have a fid
    if (fid) {
      try {
        await fetch('/api/submit-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            puzzleId: puzzle.id,
            answer,
            fid,
            username: `fid:${fid}`
          }),
        });
      } catch (error) {
        console.error('Failed to submit answer:', error);
      }
    }
  };

  const playAgain = () => {
    setPuzzle(null);
    setResult(null);
    setIsLoading(true);
    setError(null);
    setTimeout(() => window.location.reload(), 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🧩</div>
          <h1 className="text-2xl font-bold text-white">Loading Puzzle...</h1>
          <p className="text-gray-400 mt-4">Powered by Farcaster Frames</p>
          {error && <p className="text-yellow-500 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center border-2 border-purple-600">
          <div className={`text-8xl mb-6 ${result.correct ? 'text-green-500' : 'text-red-500'}`}>
            {result.correct ? '✓' : '✗'}
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            {result.correct ? 'Correct!' : 'Try Again!'}
          </h2>
          
          {!result.correct && (
            <p className="text-xl mb-6 bg-gray-700 p-4 rounded-lg">
              Solution: <span className="font-mono font-bold">{result.solution}</span>
            </p>
          )}
          
          <button
            onClick={playAgain}
            className="bg-farcaster-purple hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold text-lg w-full transition"
          >
            Play Again
          </button>
          
          <div className="mt-8">
            <button
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-white underline text-sm"
            >
              Go to Full App
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full border-2 border-purple-700">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-farcaster-purple">Math Puzzles</h1>
          <span className="text-sm font-semibold bg-purple-900 px-2 py-1 rounded">
            Farcaster Frame
          </span>
        </div>
        
        {error && (
          <div className="bg-yellow-900 text-yellow-200 p-3 rounded-lg mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {puzzle && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold bg-gray-700 px-2 py-1 rounded">
                {puzzle.type}
              </span>
              <span className="text-sm font-semibold bg-gray-700 px-2 py-1 rounded">
                {puzzle.difficulty}
              </span>
            </div>
            
            <div className="text-2xl font-bold bg-gray-900 p-6 rounded-lg text-center my-4 border border-gray-700 font-mono">
              {puzzle.problem}
            </div>
            
            {puzzle.type === 'MissingOperation' ? (
              <div className="grid grid-cols-2 gap-3">
                {puzzle.options?.map((op: string) => (
                  <button
                    key={op}
                    onClick={() => handleAnswer(op)}
                    className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-2xl transition hover:scale-105"
                  >
                    {op}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder="Enter answer"
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-center text-xl font-bold"
                  onBlur={(e) => handleAnswer(e.target.value)}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input');
                    if (input) handleAnswer(input.value);
                  }}
                  className="w-full p-4 bg-farcaster-purple hover:bg-purple-700 text-white rounded-lg font-bold transition"
                >
                  Submit Answer
                </button>
              </div>
            )}
          </div>
        )}
        
        <div className="text-center text-gray-500 text-sm mt-6 pt-4 border-t border-gray-700">
          <p>Powered by Farcaster Frames SDK</p>
          <button
            onClick={() => router.push('/')}
            className="mt-2 text-gray-400 hover:text-white underline"
          >
            Go to Full App
          </button>
        </div>
      </div>
    </div>
  );
}

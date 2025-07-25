'use client';
import * as frame from '@farcaster/frame-sdk';
import { useEffect, useState } from 'react';
import { generatePuzzle, SAMPLE_PUZZLES } from '@/lib/puzzle';
import { redis } from '@/lib/redis';
import { useRouter } from 'next/navigation';

export default function FramePage() {
  const [puzzle, setPuzzle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<{correct: boolean, solution: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initializeFrame = async () => {
      try {
        // Initialize Frame SDK
        await frame.sdk.actions.ready();
        
        // Get Farcaster context
        const context = await frame.sdk.context();
        console.log('Farcaster context:', context);
        
        // Generate a puzzle
        const puzzleType = Math.random() > 0.5 ? 'Calculation' : 'MissingOperation';
        const difficulty = ['Apprentice', 'Scholar', 'Master'][Math.floor(Math.random() * 3)];
        const puzzle = generatePuzzle(puzzleType, difficulty);
        
        // Store puzzle in Redis
        await redis.setex(`puzzle:${puzzle.id}`, 300, puzzle);
        setPuzzle(puzzle);
        
      } catch (error) {
        console.error('Frame initialization failed:', error);
        // Fallback to sample puzzle
        const sample = SAMPLE_PUZZLES[Math.floor(Math.random() * SAMPLE_PUZZLES.length)];
        setPuzzle(sample);
      }
      setIsLoading(false);
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
    
    // Send interaction to Frame
    frame.sdk.actions.track('answer_submitted', {
      puzzleId: puzzle.id,
      answer,
      correct
    });
  };

  const playAgain = () => {
    setPuzzle(null);
    setResult(null);
    setIsLoading(true);
    setTimeout(() => window.location.reload(), 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-4xl mb-4">🧩</div>
          <h1 className="text-2xl font-bold text-white">Loading Puzzle...</h1>
          <p className="text-gray-400 mt-2">Powered by Farcaster Frames</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className={`text-8xl mb-6 ${result.correct ? 'text-green-500' : 'text-red-500'}`}>
            {result.correct ? '✓' : '✗'}
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            {result.correct ? 'Correct!' : 'Try Again!'}
          </h2>
          
          {!result.correct && (
            <p className="text-xl mb-6">
              Solution: <span className="font-bold">{result.solution}</span>
            </p>
          )}
          
          <button
            onClick={playAgain}
            className="bg-farcaster-purple hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold text-lg"
          >
            Play Again
          </button>
          
          <div className="mt-8">
            <button
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-white underline"
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
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-farcaster-purple">Missing Operation</h1>
          <span className="text-sm font-semibold bg-gray-700 px-2 py-1 rounded">
            Farcaster Frame
          </span>
        </div>
        
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
            
            <div className="text-2xl font-bold bg-gray-700 p-4 rounded-lg text-center my-4">
              {puzzle.problem}
            </div>
            
            {puzzle.type === 'MissingOperation' ? (
              <div className="grid grid-cols-2 gap-3">
                {puzzle.options?.map((op: string) => (
                  <button
                    key={op}
                    onClick={() => handleAnswer(op)}
                    className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-xl transition"
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
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-center"
                  onBlur={(e) => handleAnswer(e.target.value)}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input');
                    if (input) handleAnswer(input.value);
                  }}
                  className="w-full p-3 bg-farcaster-purple hover:bg-purple-700 text-white rounded-lg font-bold"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        )}
        
        <div className="text-center text-gray-500 text-sm mt-6">
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

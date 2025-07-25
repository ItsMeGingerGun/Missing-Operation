'use client';
import { useState, useEffect } from 'react';
import AuthButton from '@/components/AuthButton';
import DifficultyCard from '@/components/DifficultyCard';
import PuzzleDisplay from '@/components/PuzzleDisplay';
import Leaderboard from '@/components/Leaderboard';
import { useNeynar } from '@/lib/neynar';
import { SAMPLE_PUZZLES } from '@/lib/puzzle';

type GameState = 'AUTH' | 'SELECT' | 'PLAYING' | 'RESULT';

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('AUTH');
  const [puzzle, setPuzzle] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [selectedType, setSelectedType] = useState<'Calculation' | 'MissingOperation'>('Calculation');
  const [gameResult, setGameResult] = useState<{correct: boolean, points: number} | null>(null);
  const { user } = useNeynar();

  // Auto-select difficulty if user is authenticated
  useEffect(() => {
    if (user) {
      setGameState('SELECT');
    }
  }, [user]);

  const startGame = async (type: 'Calculation' | 'MissingOperation', difficulty: 'Apprentice' | 'Scholar' | 'Master') => {
    setSelectedType(type);
    
    try {
      const res = await fetch('/api/generate-puzzle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type, 
          difficulty,
          fid: user?.fid
        }),
      });
      
      const data = await res.json();
      setPuzzle(data);
      setGameState('PLAYING');
    } catch (error) {
      console.error('Failed to start game:', error);
      // Fallback to sample puzzle
      const sample = SAMPLE_PUZZLES.find(p => 
        p.type === type && p.difficulty === difficulty
      );
      if (sample) {
        setPuzzle(sample);
        setGameState('PLAYING');
      }
    }
  };

  const submitAnswer = async (answer: string | number) => {
    if (!user || !puzzle) return;
    
    try {
      const res = await fetch('/api/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          puzzleId: puzzle.id, 
          answer,
          fid: user.fid,
          username: user.username
        }),
      });
      
      const result = await res.json();
      setGameResult({
        correct: result.correct,
        points: result.pointsEarned || 0
      });
      
      if (result.correct) {
        setScore(prev => prev + result.pointsEarned);
      }
    } catch (error) {
      console.error('Submission failed:', error);
      setGameResult({
        correct: false,
        points: 0
      });
    }
    
    setGameState('RESULT');
  };

  const playAgain = () => {
    setGameResult(null);
    setGameState('SELECT');
  };

  return (
    <div className="min-h-screen">
      <header className="flex justify-between items-center mb-8 py-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-farcaster-purple p-2 rounded-lg">
            <div className="text-white font-bold text-xl">🧩</div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-farcaster-purple bg-clip-text text-transparent">
            Missing Operation
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {user && gameState !== 'AUTH' && (
            <div className="bg-gray-800 px-4 py-2 rounded-lg">
              <span className="text-gray-300 mr-2">Score:</span>
              <span className="font-bold text-xl">{score}</span>
            </div>
          )}
          <AuthButton />
        </div>
      </header>

      <main>
        {gameState === 'AUTH' && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-800 rounded-xl p-8 mb-8">
                <div className="text-6xl mb-6">🧩</div>
                <h2 className="text-3xl font-bold mb-4">Solve Math Puzzles</h2>
                <p className="text-gray-300 mb-8">
                  Connect your Farcaster wallet to play and compete on the leaderboard!
                </p>
                <AuthButton />
              </div>
            </div>
          </div>
        )}

        {gameState === 'SELECT' && (
          <div className="py-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Select Puzzle Difficulty
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <DifficultyCard 
                level="Apprentice"
                numbers="1-20"
                operations="+ -"
                time={30}
                multiplier={1}
                onClick={() => startGame(selectedType, 'Apprentice')}
              />
              
              <DifficultyCard 
                level="Scholar"
                numbers="10-50"
                operations="+ - ×"
                time={25}
                multiplier={2}
                onClick={() => startGame(selectedType, 'Scholar')}
              />
              
              <DifficultyCard 
                level="Master"
                numbers="20-100"
                operations="+ - × ÷"
                time={20}
                multiplier={3}
                onClick={() => startGame(selectedType, 'Master')}
              />
            </div>
            
            <div className="mt-12 max-w-md mx-auto">
              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={() => setSelectedType('Calculation')}
                  className={`px-6 py-3 rounded-lg font-bold transition ${
                    selectedType === 'Calculation'
                      ? 'bg-purple-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  Calculation Puzzles
                </button>
                <button
                  onClick={() => setSelectedType('MissingOperation')}
                  className={`px-6 py-3 rounded-lg font-bold transition ${
                    selectedType === 'MissingOperation'
                      ? 'bg-purple-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  Missing Operation
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'PLAYING' && puzzle && (
          <div className="max-w-2xl mx-auto">
            <PuzzleDisplay puzzle={puzzle} onSubmit={submitAnswer} />
          </div>
        )}

        {gameState === 'RESULT' && gameResult && (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="text-8xl mb-6">
              {gameResult.correct ? '🎉' : '❌'}
            </div>
            <h2 className="text-4xl font-bold mb-4">
              {gameResult.correct ? 'Correct!' : 'Try Again!'}
            </h2>
            
            {gameResult.correct ? (
              <p className="text-2xl mb-6">
                +{gameResult.points} points!
              </p>
            ) : (
              <p className="text-xl mb-6">
                Solution: <span className="font-bold">{puzzle?.solution}</span>
              </p>
            )}
            
            <div className="flex justify-center gap-4">
              <button
                onClick={playAgain}
                className="bg-gradient-to-r from-purple-600 to-farcaster-purple text-white px-8 py-4 rounded-lg font-bold text-xl"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </main>

      <Leaderboard />
    </div>
  );
}

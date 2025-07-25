'use client';
import { useEffect, useState } from 'react';
import Timer from './Timer';
import { useNeynar } from '@/lib/neynar';

interface PuzzleDisplayProps {
  puzzle: {
    id: string;
    type: 'Calculation' | 'MissingOperation';
    difficulty: 'Apprentice' | 'Scholar' | 'Master';
    problem: string;
    options?: string[];
  };
  onSubmit: (answer: string | number) => void;
}

export default function PuzzleDisplay({ puzzle, onSubmit }: PuzzleDisplayProps) {
  const [answer, setAnswer] = useState<string | number>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useNeynar();
  
  const difficultyTimeMap = {
    Apprentice: 30,
    Scholar: 25,
    Master: 20,
  };

  const handleSubmit = () => {
    if (!answer || isSubmitting) return;
    setIsSubmitting(true);
    onSubmit(answer);
  };

  // Auto-submit when time runs out
  useEffect(() => {
    if (!user) return;
    
    const timeout = setTimeout(() => {
      if (!isSubmitting) {
        handleSubmit();
      }
    }, difficultyTimeMap[puzzle.difficulty] * 1000);
    
    return () => clearTimeout(timeout);
  }, [puzzle, user, isSubmitting]);

  return (
    <div className="bg-gray-800 rounded-xl shadow-xl p-6 border-2 border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold px-3 py-1 bg-gray-700 rounded-full">
          {puzzle.type} Puzzle
        </span>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${
          puzzle.difficulty === 'Apprentice' ? 'bg-apprentice text-apprentice' :
          puzzle.difficulty === 'Scholar' ? 'bg-scholar text-scholar' :
          'bg-master text-master'
        } bg-opacity-20`}>
          {puzzle.difficulty}
        </span>
      </div>
      
      <Timer 
        duration={difficultyTimeMap[puzzle.difficulty]} 
        onComplete={handleSubmit} 
        isActive={!isSubmitting}
      />
      
      <div className="text-center my-8">
        <h2 className="text-4xl font-bold bg-gray-900 p-6 rounded-xl font-mono">
          {puzzle.problem}
        </h2>
      </div>
      
      {puzzle.type === 'MissingOperation' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {puzzle.options?.map(op => (
            <button
              key={op}
              onClick={() => setAnswer(op)}
              disabled={isSubmitting}
              className={`p-4 text-2xl font-bold rounded-lg transition ${
                answer === op 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600'
              } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {op}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <input
            type="number"
            value={answer}
            onChange={e => setAnswer(Number(e.target.value))}
            disabled={isSubmitting}
            className="p-4 bg-gray-700 border border-gray-600 rounded-lg text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter answer"
          />
        </div>
      )}
      
      <button
        onClick={handleSubmit}
        disabled={!answer || isSubmitting}
        className={`mt-8 w-full py-4 text-xl font-bold rounded-lg transition ${
          answer && !isSubmitting
            ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:opacity-90'
            : 'bg-gray-700 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? 'Checking...' : 'Submit Answer'}
      </button>
    </div>
  );
}

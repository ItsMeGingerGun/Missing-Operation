'use client';
import { useEffect, useState, useRef } from 'react';

export default function Timer({ 
  duration, 
  onComplete,
  isActive = true
}: {
  duration: number;
  onComplete: () => void;
  isActive?: boolean;
}) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) return;
    
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, isActive, onComplete]);

  // Calculate percentage for progress bar
  const percentage = (timeLeft / duration) * 100;
  let colorClass = 'bg-green-500';
  
  if (percentage < 50) colorClass = 'bg-yellow-500';
  if (percentage < 25) colorClass = 'bg-red-500';

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold">Time Remaining</span>
        <span className="text-xl font-mono font-bold">{timeLeft}s</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-4">
        <div 
          className={`${colorClass} h-4 rounded-full transition-all duration-1000 ease-linear`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

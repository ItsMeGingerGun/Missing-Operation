'use client';
import Image from 'next/image';

interface DifficultyCardProps {
  level: 'Apprentice' | 'Scholar' | 'Master';
  numbers: string;
  operations: string;
  time: number;
  multiplier: number;
  onClick: () => void;
}

export default function DifficultyCard({
  level,
  numbers,
  operations,
  time,
  multiplier,
  onClick
}: DifficultyCardProps) {
  const colorMap = {
    Apprentice: 'bg-apprentice border-apprentice',
    Scholar: 'bg-scholar border-scholar',
    Master: 'bg-master border-master',
  };

  const imageMap = {
    Apprentice: '/images/apprentice.png',
    Scholar: '/images/scholar.png',
    Master: '/images/master.png',
  };

  return (
    <div 
      className={`${colorMap[level]} bg-opacity-10 border-2 rounded-xl p-6 cursor-pointer hover:scale-[1.02] transition-transform duration-300`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-white p-2 rounded-full">
          <Image 
            src={imageMap[level]} 
            alt={level} 
            width={48} 
            height={48} 
          />
        </div>
        <h3 className="text-2xl font-bold">{level}</h3>
      </div>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-300">Numbers:</span>
          <span className="font-medium">{numbers}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Operations:</span>
          <span className="font-medium">{operations}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Time:</span>
          <span className="font-medium">{time}s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Multiplier:</span>
          <span className="font-bold">x{multiplier}</span>
        </div>
      </div>
      
      <button className="mt-4 w-full py-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 font-bold rounded-lg transition">
        Play Now
      </button>
    </div>
  );
}

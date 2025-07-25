'use client';
import { useEffect, useState } from 'react';
import { useNeynar } from '@/lib/neynar';
import Image from 'next/image';

interface LeaderboardEntry {
  fid: string;
  username: string;
  score: number;
  pfp?: string;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useNeynar();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        setLeaderboard(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 mt-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Leaderboard
          </span>
          <span className="animate-pulse-slow">⚡</span>
        </h2>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg animate-pulse">
              <div className="flex items-center gap-3">
                <div className="bg-gray-600 rounded-full w-10 h-10" />
                <div className="h-4 bg-gray-600 rounded w-24" />
              </div>
              <div className="h-4 bg-gray-600 rounded w-8" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 mt-8 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
          Leaderboard
        </span>
        <span className="animate-pulse">🏆</span>
      </h2>
      
      <div className="space-y-3">
        {leaderboard.map((entry, index) => (
          <div 
            key={entry.fid} 
            className={`flex items-center justify-between p-3 rounded-lg transition-all ${
              user?.fid === entry.fid 
                ? 'bg-gradient-to-r from-purple-700 to-farcaster-purple border border-purple-500' 
                : 'bg-gray-700'
            } ${index === 0 ? 'border-2 border-yellow-400' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="text-lg font-bold w-6 text-center">
                {index === 0 ? '👑' : index + 1}
              </div>
              {entry.pfp ? (
                <Image 
                  src={entry.pfp} 
                  alt={entry.username} 
                  width={40} 
                  height={40} 
                  className="rounded-full"
                />
              ) : (
                <div className="bg-gray-600 rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-xs">FC</span>
                </div>
              )}
              <span className="font-medium">{entry.username}</span>
            </div>
            <div className="text-lg font-bold bg-gray-900 px-3 py-1 rounded-full">
              {entry.score}
            </div>
          </div>
        ))}
        
        {leaderboard.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            No scores yet. Be the first!
          </div>
        )}
      </div>
    </div>
  );
}

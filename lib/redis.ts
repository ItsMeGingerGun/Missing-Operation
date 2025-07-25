import { Redis } from '@upstash/redis';
import type { Puzzle } from '@/types';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Leaderboard operations
export const updateLeaderboard = async (fid: string, username: string, score: number) => {
  // Store user info
  await redis.hset(`user:${fid}`, { username });
  
  // Update leaderboard
  await redis.zadd('leaderboard', { 
    increment: score 
  }, `fid:${fid}`);
};

export const getLeaderboard = async (): Promise<{ fid: string; username: string; score: number; pfp?: string }[]> => {
  const rawData = await redis.zrange<string>('leaderboard', '+inf', '-inf', {
    byScore: true,
    rev: true,
    offset: 0,
    count: 10,
    withScores: true,
  });

  const leaderboard = [];
  
  for (let i = 0; i < rawData.length; i += 2) {
    const fid = rawData[i].split(':')[1];
    const score = Number(rawData[i+1]);
    
    if (fid && !isNaN(score)) {
      const userInfo = await redis.hgetall(`user:${fid}`);
      leaderboard.push({
        fid,
        username: userInfo?.username || `User ${fid}`,
        pfp: userInfo?.pfp,
        score
      });
    }
  }
  
  return leaderboard;
};

// Puzzle storage with 10min TTL
export const storePuzzle = (puzzle: Puzzle) => {
  return redis.setex(`puzzle:${puzzle.id}`, 600, puzzle);
};

// User session storage
export const storeUser = async (fid: string, username: string, pfp: string) => {
  await redis.hset(`user:${fid}`, { username, pfp });
};

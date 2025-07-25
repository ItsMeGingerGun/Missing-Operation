import { redis, updateLeaderboard } from '../../lib/redis';
import { rateLimit } from '../../lib/rate-limit';
import { NextResponse } from 'next/server';
import type { Puzzle } from '../../types';
import { trackFrameEvent } from '../../lib/frameAnalytics';

export async function POST(req: Request) {
  const { puzzleId, answer, fid, username } = await req.json();
  
  // Rate limiting
  if (!(await rateLimit(fid))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // Check both regular and frame puzzles
    let puzzle = await redis.get<Puzzle>(`puzzle:${puzzleId}`);
    if (!puzzle) {
      puzzle = await redis.get<Puzzle>(`frame:puzzle:${puzzleId}`);
    }
    
    if (!puzzle) {
      return NextResponse.json({ error: 'Puzzle not found' }, { status: 404 });
    }
    
    let isCorrect = false;
    if (puzzle.type === 'Calculation') {
      isCorrect = Math.abs(puzzle.solution - Number(answer)) < 0.001;
    } else {
      isCorrect = puzzle.solution === answer;
    }
    
    let pointsEarned = 0;
    if (isCorrect) {
      const multipliers: Record<string, number> = { 
        Apprentice: 1, 
        Scholar: 2, 
        Master: 3 
      };
      pointsEarned = 100 * multipliers[puzzle.difficulty];
      await updateLeaderboard(fid, username, pointsEarned);
    }
    
    // Track analytics
    if (isCorrect) {
      trackFrameEvent('correct_answer', {
        puzzleId,
        fid,
        pointsEarned
      });
    } else {
      trackFrameEvent('incorrect_answer', {
        puzzleId,
        fid
      });
    }
    
    return NextResponse.json({ 
      correct: isCorrect, 
      pointsEarned,
      solution: puzzle.solution
    });
  } catch (error) {
    console.error('Answer submission error:', error);
    return NextResponse.json({ error: 'Failed to process answer' }, { status: 500 });
  }
}

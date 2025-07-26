import { generatePuzzle } from '../../lib/puzzle';
import { storePuzzle } from '../../lib/redis';
import { rateLimit } from '../../lib/rate-limit';
import { NextResponse } from 'next/server';
import type { Puzzle } from '../../types';

export async function POST(req: Request) {
  const { fid, type, difficulty } = await req.json();
  
  // Rate limiting
  if (!(await rateLimit(fid))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const puzzle = generatePuzzle(type, difficulty);
    await storePuzzle(puzzle);
    
    // Return without solution
    const { solution, ...response } = puzzle;
    return NextResponse.json(response);
  } catch (error) {
    console.error('Puzzle generation error:', error);
    return NextResponse.json({ error: 'Failed to generate puzzle' }, { status: 500 });
  }
}

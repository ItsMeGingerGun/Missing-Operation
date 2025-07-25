export interface Puzzle {
  id: string;
  type: 'Calculation' | 'MissingOperation';
  difficulty: 'Apprentice' | 'Scholar' | 'Master';
  problem: string;
  solution: number | string;
  options?: string[];
}

export interface LeaderboardEntry {
  fid: string;
  username: string;
  score: number;
  pfp?: string;
}

export interface GameResult {
  correct: boolean;
  pointsEarned: number;
  solution: number | string;
}

export interface DifficultyConfig {
  min: number;
  max: number;
  operators: string[];
  time: number;
  multiplier: number;
}

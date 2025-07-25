import type { Puzzle } from '@/types';

const configs = {
  Apprentice: { min: 1, max: 20, operators: ['+', '-'], time: 30, multiplier: 1 },
  Scholar: { min: 10, max: 50, operators: ['+', '-', '×'], time: 25, multiplier: 2 },
  Master: { min: 20, max: 100, operators: ['+', '-', '×', '÷'], time: 20, multiplier: 3 }
};

export const generatePuzzle = (
  type: 'Calculation' | 'MissingOperation',
  difficulty: 'Apprentice' | 'Scholar' | 'Master'
): Puzzle => {
  const config = configs[difficulty];
  const id = crypto.randomUUID();

  if (type === 'Calculation') {
    // Generate 4 numbers
    const nums = Array(4).fill(0).map(() => 
      Math.floor(Math.random() * (config.max - config.min + 1)) + config.min
    );
    
    // Generate 3 operators
    const ops = Array(3).fill(0).map(() => 
      config.operators[Math.floor(Math.random() * config.operators.length)]
    );
    
    // Ensure division results in integers
    if (ops.includes('÷')) {
      for (let i = 0; i < ops.length; i++) {
        if (ops[i] === '÷') {
          // Find a divisor that results in integer
          const divisor = Math.max(1, Math.floor(Math.random() * 5) + 1);
          nums[i+1] = nums[i] * divisor;
        }
      }
    }
    
    const problem = `${nums[0]} ${ops[0]} ${nums[1]} ${ops[1]} ${nums[2]} ${ops[2]} ${nums[3]}`;
    const solution = evaluateExpression(problem);
    
    return { id, type, difficulty, problem, solution };
  } else {
    // Generate numbers and operation
    const a = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
    const b = Math.floor(Math.random() * (config.max/2 - 2 + 1)) + 2;
    const op = config.operators[Math.floor(Math.random() * config.operators.length)];
    
    // Calculate result
    const result = evaluateExpression(`${a} ${op} ${b}`);
    
    // Create problem string
    const problem = `${a} ? ${b} = ${result}`;
    
    return { 
      id, 
      type, 
      difficulty, 
      problem, 
      solution: op,
      options: ['+', '-', '×', '÷']
    };
  }
};

const evaluateExpression = (expr: string): number => {
  const safeExpr = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/');
  
  // Safe evaluation using Function
  return Function(`"use strict"; return (${safeExpr})`)();
};

// Sample puzzles for testing
export const SAMPLE_PUZZLES: Puzzle[] = [
  { id: '1', type: 'Calculation', difficulty: 'Apprentice', problem: '5 + 12 - 3 + 8', solution: 22 },
  { id: '2', type: 'Calculation', difficulty: 'Scholar', problem: '15 × 3 + 7 - 12', solution: 40 },
  { id: '3', type: 'Calculation', difficulty: 'Master', problem: '84 ÷ 4 + 15 × 2', solution: 51 },
  { id: '4', type: 'MissingOperation', difficulty: 'Apprentice', problem: '20 ? 5 + 10 = 14', solution: '-', options: ['+', '-', '×', '÷'] },
];

// Frame-specific puzzle generation (simplified for Frames)
export const generateFramePuzzle = (): Puzzle => {
  const type = Math.random() > 0.5 ? 'Calculation' : 'MissingOperation';
  const difficulty = ['Apprentice', 'Scholar', 'Master'][Math.floor(Math.random() * 3)] as 'Apprentice' | 'Scholar' | 'Master';
  return generatePuzzle(type, difficulty);
};

// Add frame-specific sample puzzles
export const FRAME_SAMPLE_PUZZLES: Puzzle[] = [
  { id: 'frame1', type: 'Calculation', difficulty: 'Apprentice', problem: '8 + 5 - 3 × 2', solution: 12 },
  { id: 'frame2', type: 'MissingOperation', difficulty: 'Scholar', problem: '30 ? 6 × 4 = 6', solution: '-', options: ['+', '-', '×', '÷'] },
  { id: 'frame3', type: 'Calculation', difficulty: 'Master', problem: '45 ÷ 9 + 7 × 3', solution: 26 },
  { id: 'frame4', type: 'MissingOperation', difficulty: 'Apprentice', problem: '15 ? 3 + 4 = 19', solution: '+', options: ['+', '-', '×', '÷'] },
];

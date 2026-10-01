import { ChallengeLevel, GameMode } from '../types/game';

export interface ModeConfig {
  mode: GameMode;
  title: string;
  shortDesc: string;
  fullDesc: string;
  defaultBoardSize: 4 | 5 | 6;
  initialTimeRemaining: number;
  allowsContinuation: boolean;
  allowsUndo: boolean;
  allowsPowerUps: boolean;
  calculateTimeBonus?: (highestTileMerged: number, mergesCount: number) => number;
}

export const CHALLENGE_LEVELS: ChallengeLevel[] = [
  {
    id: 1,
    levelNumber: 1,
    title: 'Beginner Merge',
    targetTile: 32,
    moveLimit: 30,
    difficulty: 'EASY',
  },
  {
    id: 2,
    levelNumber: 2,
    title: 'Quick Combo',
    targetTile: 64,
    moveLimit: 50,
    difficulty: 'EASY',
  },
  {
    id: 3,
    levelNumber: 3,
    title: 'Centurion Trial',
    targetTile: 128,
    moveLimit: 80,
    difficulty: 'MEDIUM',
  },
  {
    id: 4,
    levelNumber: 4,
    title: 'Quarter Master',
    targetTile: 256,
    moveLimit: 120,
    difficulty: 'MEDIUM',
  },
  {
    id: 5,
    levelNumber: 5,
    title: 'Half-K Pursuit',
    targetTile: 512,
    moveLimit: 180,
    difficulty: 'HARD',
  },
  {
    id: 6,
    levelNumber: 6,
    title: 'Kilo Challenge',
    targetTile: 1024,
    moveLimit: 250,
    difficulty: 'HARD',
  },
  {
    id: 7,
    levelNumber: 7,
    title: 'Grand 2048 Rush',
    targetTile: 2048,
    moveLimit: 400,
    difficulty: 'EXPERT',
  },
];

export const GAME_MODE_CONFIGS: Record<GameMode, ModeConfig> = {
  CLASSIC: {
    mode: 'CLASSIC',
    title: 'Classic Mode',
    shortDesc: 'Reach 2048',
    fullDesc: 'Traditional 2048 puzzle. Merge tiles to reach 2048 and continue for higher scores.',
    defaultBoardSize: 4,
    initialTimeRemaining: 0,
    allowsContinuation: true,
    allowsUndo: true,
    allowsPowerUps: true,
  },
  ENDLESS: {
    mode: 'ENDLESS',
    title: 'Endless Mode',
    shortDesc: 'Go beyond 2048',
    fullDesc: 'No limits. Push your skills to reach 4096, 8192, 16384, and beyond.',
    defaultBoardSize: 4,
    initialTimeRemaining: 0,
    allowsContinuation: true,
    allowsUndo: true,
    allowsPowerUps: true,
  },
  TIME_ATTACK: {
    mode: 'TIME_ATTACK',
    title: 'Time Attack',
    shortDesc: 'Score before time runs out',
    fullDesc: '60 seconds on the clock. Earn bonus seconds on every merge!',
    defaultBoardSize: 4,
    initialTimeRemaining: 60,
    allowsContinuation: true,
    allowsUndo: true,
    allowsPowerUps: true,
    calculateTimeBonus: (highestTileMerged: number, mergesCount: number): number => {
      if (mergesCount <= 0 || highestTileMerged <= 0) return 0;
      if (highestTileMerged >= 128) {
        return 3;
      } else if (highestTileMerged >= 32) {
        return 2;
      } else {
        return 1;
      }
    },
  },
  MOVES_CHALLENGE: {
    mode: 'MOVES_CHALLENGE',
    title: 'Moves Challenge',
    shortDesc: 'Reach target in limited moves',
    fullDesc: 'Reach the target tile before running out of move attempts.',
    defaultBoardSize: 4,
    initialTimeRemaining: 0,
    allowsContinuation: false,
    allowsUndo: false,
    allowsPowerUps: false,
  },
  HARDCORE: {
    mode: 'HARDCORE',
    title: 'Hardcore Mode',
    shortDesc: 'Standard rules. No help.',
    fullDesc: 'Original 2048 rules with no second chances. No Undo. No Power-ups. Pure skill.',
    defaultBoardSize: 4,
    initialTimeRemaining: 0,
    allowsContinuation: false,
    allowsUndo: false,
    allowsPowerUps: false,
  },
  MEGA_BOARD: {
    mode: 'MEGA_BOARD',
    title: 'Mega Board',
    shortDesc: 'More space. Bigger numbers.',
    fullDesc: 'Expanded 5x5 grid with more space, more possibilities, and massive numbers.',
    defaultBoardSize: 5,
    initialTimeRemaining: 0,
    allowsContinuation: true,
    allowsUndo: true,
    allowsPowerUps: true,
  },
  BOMB: {
    mode: 'BOMB',
    title: 'Bomb Mode',
    shortDesc: 'Clear crowded areas with strategic bombs',
    fullDesc: 'Bomb tiles spawn periodically. Trigger them with adjacent merges to detonate a 3x3 surrounding area!',
    defaultBoardSize: 4,
    initialTimeRemaining: 0,
    allowsContinuation: true,
    allowsUndo: false,
    allowsPowerUps: false,
  },
  ICE: {
    mode: 'ICE',
    title: 'Ice Mode',
    shortDesc: 'Break frozen tiles with smart merges',
    fullDesc: 'Frozen tiles block movement. Perform 3 adjacent merges nearby to shatter the ice and free the tile!',
    defaultBoardSize: 4,
    initialTimeRemaining: 0,
    allowsContinuation: true,
    allowsUndo: false,
    allowsPowerUps: false,
  },
  DAILY_CHALLENGE: {
    mode: 'DAILY_CHALLENGE',
    title: 'Daily Challenge',
    shortDesc: 'A new puzzle every day. No internet required.',
    fullDesc: 'Deterministically generated daily objective. Win to build and maintain your daily streak!',
    defaultBoardSize: 4,
    initialTimeRemaining: 0,
    allowsContinuation: false,
    allowsUndo: false,
    allowsPowerUps: false,
  },
};

export const getMilestoneMessage = (value: number): string | null => {
  const milestones = [2048, 4096, 8192, 16384, 32768, 65536];
  if (milestones.includes(value)) {
    return `${value}!`;
  }
  return null;
};

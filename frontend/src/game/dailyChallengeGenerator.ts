import { DailyChallengeConfig } from '../types/game';

/**
 * Gets today's local date string in YYYY-MM-DD format
 */
export const getTodayDateSeed = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Simple string hash function to generate a deterministic integer seed from date string
 */
export const hashDateString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Formats YYYY-MM-DD string into human-readable label
 */
export const formatReadableDate = (dateSeed: string): string => {
  try {
    const [y, m, d] = dateSeed.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateSeed;
  }
};

const CHALLENGE_TITLES = [
  'Century Sprint',
  'Quarter Master Challenge',
  'Half-K Pursuit',
  'Kilo Rush',
  'Grand 2048 Trial',
  'Efficiency Test',
  'Endurance Run',
  'Precision Merge',
];

const TARGET_TILES = [512, 1024, 1024, 2048, 512, 1024, 2048];
const MOVE_LIMITS = [120, 160, 180, 220, 140, 200, 250];
const DIFFICULTIES: ('EASY' | 'MEDIUM' | 'HARD' | 'EXPERT')[] = [
  'EASY',
  'MEDIUM',
  'MEDIUM',
  'HARD',
  'MEDIUM',
  'HARD',
  'EXPERT',
];

/**
 * Generates a deterministic Daily Challenge configuration for any date string (YYYY-MM-DD)
 */
export const generateDailyChallenge = (dateSeed: string = getTodayDateSeed()): DailyChallengeConfig => {
  const seed = hashDateString(dateSeed);

  const titleIndex = seed % CHALLENGE_TITLES.length;
  const targetTileIndex = (seed >> 2) % TARGET_TILES.length;
  const moveLimitIndex = (seed >> 4) % MOVE_LIMITS.length;
  const difficultyIndex = (seed >> 3) % DIFFICULTIES.length;

  const targetTile = TARGET_TILES[targetTileIndex];
  const moveLimit = MOVE_LIMITS[moveLimitIndex];
  const title = CHALLENGE_TITLES[titleIndex];
  const difficulty = DIFFICULTIES[difficultyIndex];

  const description = `Reach the ${targetTile} tile within ${moveLimit} moves.`;

  return {
    dateSeed,
    title,
    description,
    targetTile,
    moveLimit,
    difficulty,
  };
};

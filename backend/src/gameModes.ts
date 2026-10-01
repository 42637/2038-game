export type GameMode =
  | 'CLASSIC'
  | 'ENDLESS'
  | 'TIME_ATTACK'
  | 'MOVES_CHALLENGE'
  | 'HARDCORE'
  | 'MEGA_BOARD';

export interface ModeConfig {
  mode: GameMode;
  title: string;
  shortDesc: string;
  fullDesc: string;
  defaultBoardSize: number;
  initialTimeRemaining: number;
  allowsContinuation: boolean;
  allowsUndo: boolean;
  allowsPowerUps: boolean;
}

export interface ChallengeLevel {
  id: number;
  levelNumber: number;
  title: string;
  targetTile: number;
  moveLimit: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
}

export interface ScoreSubmission {
  playerName?: string;
  mode: GameMode;
  score: number;
  highestTile: number;
  moves: number;
  challengeLevelId?: number;
  timestamp?: string;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  mode: GameMode;
  score: number;
  highestTile: number;
  moves: number;
  challengeLevelId?: number;
  date: string;
}

export const BACKEND_GAME_MODE_CONFIGS: Record<GameMode, ModeConfig> = {
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
};

export const BACKEND_CHALLENGE_LEVELS: ChallengeLevel[] = [
  { id: 1, levelNumber: 1, title: 'Beginner Merge', targetTile: 32, moveLimit: 30, difficulty: 'EASY' },
  { id: 2, levelNumber: 2, title: 'Quick Combo', targetTile: 64, moveLimit: 50, difficulty: 'EASY' },
  { id: 3, levelNumber: 3, title: 'Centurion Trial', targetTile: 128, moveLimit: 80, difficulty: 'MEDIUM' },
  { id: 4, levelNumber: 4, title: 'Quarter Master', targetTile: 256, moveLimit: 120, difficulty: 'MEDIUM' },
  { id: 5, levelNumber: 5, title: 'Half-K Pursuit', targetTile: 512, moveLimit: 180, difficulty: 'HARD' },
  { id: 6, levelNumber: 6, title: 'Kilo Challenge', targetTile: 1024, moveLimit: 250, difficulty: 'HARD' },
  { id: 7, levelNumber: 7, title: 'Grand 2048 Rush', targetTile: 2048, moveLimit: 400, difficulty: 'EXPERT' },
];

// In-Memory Leaderboard Storage with initial seed data
class LeaderboardStore {
  private entries: LeaderboardEntry[] = [
    { id: '1', playerName: 'CyberPlayer', mode: 'CLASSIC', score: 24580, highestTile: 2048, moves: 820, date: '2026-09-14' },
    { id: '2', playerName: 'TileMaster', mode: 'CLASSIC', score: 18420, highestTile: 1024, moves: 650, date: '2026-09-13' },
    { id: '3', playerName: 'GridRunner', mode: 'ENDLESS', score: 58940, highestTile: 4096, moves: 1640, date: '2026-09-14' },
    { id: '4', playerName: 'SpeedDemon', mode: 'TIME_ATTACK', score: 12860, highestTile: 1024, moves: 410, date: '2026-09-15' },
    { id: '5', playerName: 'PureSkillz', mode: 'HARDCORE', score: 16384, highestTile: 2048, moves: 790, date: '2026-09-12' },
    { id: '6', playerName: 'MegaGamer', mode: 'MEGA_BOARD', score: 84200, highestTile: 8192, moves: 2100, date: '2026-09-15' },
    { id: '7', playerName: 'ChallengerX', mode: 'MOVES_CHALLENGE', score: 4096, highestTile: 2048, moves: 310, challengeLevelId: 7, date: '2026-09-14' },
  ];

  public getLeaderboard(mode?: GameMode): LeaderboardEntry[] {
    let filtered = this.entries;
    if (mode) {
      filtered = this.entries.filter((e) => e.mode === mode);
    }
    return [...filtered].sort((a, b) => b.score - a.score).slice(0, 50);
  }

  public addScore(sub: ScoreSubmission): { entry: LeaderboardEntry; rank: number; isNewBest: boolean } {
    const playerName = sub.playerName || 'Anonymous Player';
    const newEntry: LeaderboardEntry = {
      id: Math.random().toString(36).substring(2, 9),
      playerName,
      mode: sub.mode,
      score: sub.score,
      highestTile: sub.highestTile,
      moves: sub.moves,
      challengeLevelId: sub.challengeLevelId,
      date: new Date().toISOString().split('T')[0],
    };

    const modeScores = this.entries.filter((e) => e.mode === sub.mode);
    const prevBest = modeScores.length > 0 ? Math.max(...modeScores.map((e) => e.score)) : 0;
    const isNewBest = sub.score > prevBest;

    this.entries.push(newEntry);

    const sortedModeScores = this.getLeaderboard(sub.mode);
    const rank = sortedModeScores.findIndex((e) => e.id === newEntry.id) + 1;

    return { entry: newEntry, rank: rank > 0 ? rank : sortedModeScores.length, isNewBest };
  }

  public getGlobalStats() {
    const totalSubmissions = this.entries.length;
    const totalScore = this.entries.reduce((acc, curr) => acc + curr.score, 0);
    const maxHighestTile = this.entries.reduce((max, curr) => Math.max(max, curr.highestTile), 0);

    const modeCounts: Record<string, number> = {};
    for (const entry of this.entries) {
      modeCounts[entry.mode] = (modeCounts[entry.mode] || 0) + 1;
    }

    return {
      totalSubmissions,
      totalScore,
      maxHighestTile,
      modeCounts,
    };
  }
}

export const leaderboardStore = new LeaderboardStore();

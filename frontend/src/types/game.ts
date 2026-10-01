export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameMode =
  | 'CLASSIC'
  | 'ENDLESS'
  | 'TIME_ATTACK'
  | 'MOVES_CHALLENGE'
  | 'HARDCORE'
  | 'MEGA_BOARD'
  | 'BOMB'
  | 'ICE'
  | 'DAILY_CHALLENGE';

export type BoardSize = 4 | 5 | 6;

export type SpecialTileType = 'BOMB' | 'ICE';

export interface Tile {
  id: string;
  value: number;
  row: number;
  col: number;
  mergedFrom?: Tile[];
  isNew?: boolean;
  isMerged?: boolean;
  specialType?: SpecialTileType;
  isFrozen?: boolean;
  iceHitCount?: number; // 0 to 3 adjacent merges required to unfreeze
  fuseTimer?: number; // Moves remaining until bomb auto-explodes
}

export type BoardMatrix = (Tile | null)[][];

export interface MergedCoordinate {
  row: number;
  col: number;
  score: number;
}

export interface MoveResult {
  board: BoardMatrix;
  scoreGained: number;
  moved: boolean;
  mergesCount: number;
  highestTileMerged: number;
  mergedCoords?: MergedCoordinate[];
}

export interface ChallengeLevel {
  id: number;
  levelNumber: number;
  title: string;
  targetTile: number;
  moveLimit: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
}

export interface DailyChallengeConfig {
  dateSeed: string; // YYYY-MM-DD
  title: string;
  description: string;
  targetTile?: number;
  targetScore?: number;
  moveLimit?: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
}

export interface DailyHistoryRecord {
  date: string;
  completed: boolean;
  score: number;
  moves: number;
  highestTile: number;
}

export interface DailyStreakState {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate?: string;
  unlockedThemes: string[];
}

export interface PersonalRecordEntry {
  id: string;
  mode: GameMode;
  score: number;
  highestTile: number;
  moves: number;
  date: string;
}

export interface FloatingScore {
  id: string;
  score: number;
  row: number;
  col: number;
}

export interface UndoSnapshot {
  board: BoardMatrix;
  score: number;
  moves: number;
  highestTile: number;
}

export interface PowerupInventory {
  hammer: number;
  shuffle: number;
}

export interface GameState {
  mode: GameMode;
  boardSize: BoardSize;
  board: BoardMatrix;
  score: number;
  moves: number;
  highestTile: number;
  totalMerges: number;
  timeRemaining: number; // for TIME_ATTACK mode (seconds)
  challengeId?: number;
  targetTile?: number;
  targetScore?: number;
  moveLimit?: number;
  bombsTriggered?: number;
  iceCleared?: number;
  dailyDate?: string;
  isChallengeComplete?: boolean;
  isChallengeFailed?: boolean;
  isGameOver: boolean;
  isPaused: boolean;
  isWon: boolean;
  hasContinuedAfter2048: boolean;
  active: boolean;
  undoStack?: UndoSnapshot[];
  powerups?: PowerupInventory;
}

export type Theme = 'CLASSIC' | 'ICE' | 'DARK' | 'CYBER' | 'SUNSET';

export interface SettingsState {
  boardSize: BoardSize;
  theme: Theme;
  musicEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  animationsEnabled: boolean;
}

export interface MovesChallengeRecordsState {
  highestUnlockedLevel: number;
  completedLevels: number[];
  bestMovesPerLevel: Record<number, number>;
  bestScorePerLevel: Record<number, number>;
  attemptsCount: number;
}

export interface ModeRecord {
  bestScore: number;
  highestTile: number;
  bestMoves: number;
  gamesPlayed: number;
}

export interface RecordsState {
  classicBest: number;
  classicHighestTile: number;
  endlessBest: number;
  endlessHighestTile: number;
  timeAttackBest: number;
  timeAttackHighestTile: number;
  movesChallenge: MovesChallengeRecordsState;
  hardcore: ModeRecord;
  megaBoard: ModeRecord;
  bomb: ModeRecord & { bombsTriggered: number };
  ice: ModeRecord & { iceCleared: number };
  daily: {
    bestScore: number;
    highestTile: number;
    challengesCompleted: number;
    streak: DailyStreakState;
    history: Record<string, DailyHistoryRecord>;
  };
  personalLeaderboards: Record<GameMode, PersonalRecordEntry[]>;
}

export interface StatisticsState {
  gamesPlayed: number;
  totalScore: number;
  totalMerges: number;
  highestTile: number;
  classicGames: number;
  endlessGames: number;
  timeAttackGames: number;
  movesChallengeCompleted: number;
  movesChallengeAttempts: number;
  hardcoreGames: number;
  hardcoreHighestTile: number;
  megaBoardGames: number;
  megaBoardHighestTile: number;
  megaBoardBestScore: number;
  bombGames: number;
  bombsTriggered: number;
  bombBestScore: number;
  iceGames: number;
  iceCleared: number;
  iceBestScore: number;
  dailyAttempted: number;
  dailyCompleted: number;
  dailyBestScore: number;
  currentDailyStreak: number;
  bestDailyStreak: number;
}

export interface TutorialState {
  completed: boolean;
}

export interface FirstTimeIntrosState {
  hardcoreShown: boolean;
  movesChallengeShown: boolean;
  megaBoardShown: boolean;
  bombShown: boolean;
  iceShown: boolean;
  dailyShown: boolean;
}

export type ActiveScreen =
  | 'SPLASH'
  | 'TUTORIAL'
  | 'MAIN_MENU'
  | 'CHALLENGE_SELECT'
  | 'DAILY_CHALLENGE'
  | 'GAMEPLAY'
  | 'BEST_SCORES'
  | 'STATISTICS'
  | 'HOW_TO_PLAY'
  | 'SETTINGS'
  | 'ABOUT';

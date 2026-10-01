import {
  FirstTimeIntrosState,
  GameState,
  RecordsState,
  SettingsState,
  StatisticsState,
  TutorialState,
} from '../types/game';

const KEYS = {
  SETTINGS: 'merge2048_v3_settings',
  RECORDS: 'merge2048_v3_records',
  STATS: 'merge2048_v3_stats',
  TUTORIAL: 'merge2048_v1_tutorial',
  GAME_STATE: 'merge2048_v3_gamestate',
  FIRST_TIME_INTROS: 'merge2048_v3_intros',
};

export const DEFAULT_SETTINGS: SettingsState = {
  boardSize: 4,
  theme: 'CLASSIC',
  musicEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  animationsEnabled: true,
};

export const DEFAULT_RECORDS: RecordsState = {
  classicBest: 0,
  classicHighestTile: 0,
  endlessBest: 0,
  endlessHighestTile: 0,
  timeAttackBest: 0,
  timeAttackHighestTile: 0,
  movesChallenge: {
    highestUnlockedLevel: 1,
    completedLevels: [],
    bestMovesPerLevel: {},
    bestScorePerLevel: {},
    attemptsCount: 0,
  },
  hardcore: {
    bestScore: 0,
    highestTile: 0,
    bestMoves: 0,
    gamesPlayed: 0,
  },
  megaBoard: {
    bestScore: 0,
    highestTile: 0,
    bestMoves: 0,
    gamesPlayed: 0,
  },
  bomb: {
    bestScore: 0,
    highestTile: 0,
    bestMoves: 0,
    gamesPlayed: 0,
    bombsTriggered: 0,
  },
  ice: {
    bestScore: 0,
    highestTile: 0,
    bestMoves: 0,
    gamesPlayed: 0,
    iceCleared: 0,
  },
  daily: {
    bestScore: 0,
    highestTile: 0,
    challengesCompleted: 0,
    streak: {
      currentStreak: 0,
      bestStreak: 0,
      unlockedThemes: [],
    },
    history: {},
  },
  personalLeaderboards: {
    CLASSIC: [],
    ENDLESS: [],
    TIME_ATTACK: [],
    MOVES_CHALLENGE: [],
    HARDCORE: [],
    MEGA_BOARD: [],
    BOMB: [],
    ICE: [],
    DAILY_CHALLENGE: [],
  },
};

export const DEFAULT_STATS: StatisticsState = {
  gamesPlayed: 0,
  totalScore: 0,
  totalMerges: 0,
  highestTile: 0,
  classicGames: 0,
  endlessGames: 0,
  timeAttackGames: 0,
  movesChallengeCompleted: 0,
  movesChallengeAttempts: 0,
  hardcoreGames: 0,
  hardcoreHighestTile: 0,
  megaBoardGames: 0,
  megaBoardHighestTile: 0,
  megaBoardBestScore: 0,
  bombGames: 0,
  bombsTriggered: 0,
  bombBestScore: 0,
  iceGames: 0,
  iceCleared: 0,
  iceBestScore: 0,
  dailyAttempted: 0,
  dailyCompleted: 0,
  dailyBestScore: 0,
  currentDailyStreak: 0,
  bestDailyStreak: 0,
};

export const DEFAULT_TUTORIAL: TutorialState = {
  completed: false,
};

export const DEFAULT_FIRST_TIME_INTROS: FirstTimeIntrosState = {
  hardcoreShown: false,
  movesChallengeShown: false,
  megaBoardShown: false,
  bombShown: false,
  iceShown: false,
  dailyShown: false,
};

// Safe wrapper around localStorage with fallback & migration
const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw);
    if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
      return { ...defaultValue, ...parsed } as T;
    }
    return parsed as T;
  } catch (err) {
    console.warn(`Failed to read key ${key} from storage, resetting to default:`, err);
    return defaultValue;
  }
};

const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to save key ${key} to storage:`, err);
  }
};

export const storageService = {
  getSettings: (): SettingsState => getItem(KEYS.SETTINGS, DEFAULT_SETTINGS),
  saveSettings: (settings: SettingsState): void => setItem(KEYS.SETTINGS, settings),

  getRecords: (): RecordsState => getItem(KEYS.RECORDS, DEFAULT_RECORDS),
  saveRecords: (records: RecordsState): void => setItem(KEYS.RECORDS, records),

  getStats: (): StatisticsState => getItem(KEYS.STATS, DEFAULT_STATS),
  saveStats: (stats: StatisticsState): void => setItem(KEYS.STATS, stats),

  getTutorial: (): TutorialState => getItem(KEYS.TUTORIAL, DEFAULT_TUTORIAL),
  saveTutorial: (tutorial: TutorialState): void => setItem(KEYS.TUTORIAL, tutorial),

  getFirstTimeIntros: (): FirstTimeIntrosState =>
    getItem(KEYS.FIRST_TIME_INTROS, DEFAULT_FIRST_TIME_INTROS),
  saveFirstTimeIntros: (intros: FirstTimeIntrosState): void =>
    setItem(KEYS.FIRST_TIME_INTROS, intros),

  getGameState: (): GameState | null => getItem<GameState | null>(KEYS.GAME_STATE, null),
  saveGameState: (state: GameState | null): void => setItem(KEYS.GAME_STATE, state),

  resetAllProgress: (): void => {
    try {
      localStorage.removeItem(KEYS.RECORDS);
      localStorage.removeItem(KEYS.STATS);
      localStorage.removeItem(KEYS.TUTORIAL);
      localStorage.removeItem(KEYS.GAME_STATE);
      localStorage.removeItem(KEYS.FIRST_TIME_INTROS);
    } catch (err) {
      console.warn('Error resetting progress:', err);
    }
  },
};

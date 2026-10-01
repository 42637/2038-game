import {
  FirstTimeIntrosState,
  GameState,
  RecordsState,
  SettingsState,
  StatisticsState,
  TutorialState,
} from '../types/game';

export const CURRENT_STORAGE_VERSION = 1;

export const STORAGE_KEYS = {
  VERSION: 'merge2048_save_version',
  SETTINGS: 'merge2048_v3_settings',
  RECORDS: 'merge2048_v3_records',
  STATS: 'merge2048_v3_stats',
  TUTORIAL: 'merge2048_v1_tutorial',
  GAME_STATE: 'merge2048_v3_gamestate',
  FIRST_TIME_INTROS: 'merge2048_v3_intros',
} as const;

export interface StorageVersionEnvelope<T> {
  version: number;
  timestamp: number;
  data: T;
}

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

// In-memory fallback map if localStorage is restricted or unavailable
const memoryFallbackMap = new Map<string, string>();

function getStorageBackend(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (err) {
    // Restricted environment (e.g. private mode iframe)
  }
  return null;
}

function getItemRaw(key: string): string | null {
  const storage = getStorageBackend();
  if (storage) {
    try {
      return storage.getItem(key);
    } catch (err) {
      console.warn(`[gameStorage] Failed to getItem for '${key}':`, err);
    }
  }
  return memoryFallbackMap.get(key) || null;
}

function setItemRaw(key: string, value: string): void {
  const storage = getStorageBackend();
  if (storage) {
    try {
      storage.setItem(key, value);
      return;
    } catch (err) {
      console.warn(`[gameStorage] Failed to setItem for '${key}':`, err);
    }
  }
  memoryFallbackMap.set(key, value);
}

function removeItemRaw(key: string): void {
  const storage = getStorageBackend();
  if (storage) {
    try {
      storage.removeItem(key);
      return;
    } catch (err) {
      console.warn(`[gameStorage] Failed to removeItem for '${key}':`, err);
    }
  }
  memoryFallbackMap.delete(key);
}

/**
 * Deeply merges default object values with loaded object properties
 * to ensure schema stability across updates and avoid undefined errors.
 */
function deepMergeDefaults<T>(defaultObj: T, parsedObj: any): T {
  if (
    typeof defaultObj !== 'object' ||
    defaultObj === null ||
    Array.isArray(defaultObj)
  ) {
    return parsedObj !== undefined ? (parsedObj as T) : defaultObj;
  }

  const result: any = Array.isArray(defaultObj) ? [] : { ...parsedObj };

  for (const key of Object.keys(defaultObj as any)) {
    const defaultVal = (defaultObj as any)[key];
    const parsedVal = parsedObj ? parsedObj[key] : undefined;

    if (parsedVal === undefined || parsedVal === null) {
      result[key] = defaultVal;
    } else if (
      typeof defaultVal === 'object' &&
      defaultVal !== null &&
      !Array.isArray(defaultVal) &&
      typeof parsedVal === 'object' &&
      !Array.isArray(parsedVal)
    ) {
      result[key] = deepMergeDefaults(defaultVal, parsedVal);
    } else {
      result[key] = parsedVal;
    }
  }

  return result as T;
}

/**
 * Safe local storage reader with JSON error handling and schema fallback.
 */
function safeRead<T>(key: string, defaultValue: T): T {
  try {
    const raw = getItemRaw(key);
    if (!raw) return defaultValue;

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.warn(`[gameStorage] Corrupted save data at key '${key}', resetting to defaults:`, err);
      return defaultValue;
    }

    if (parsed === null || parsed === undefined) {
      return defaultValue;
    }

    // Unwrap version envelope if present
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'version' in parsed &&
      'data' in parsed
    ) {
      parsed = parsed.data;
    }

    if (
      typeof defaultValue === 'object' &&
      defaultValue !== null &&
      !Array.isArray(defaultValue) &&
      typeof parsed === 'object' &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      return deepMergeDefaults(defaultValue, parsed);
    }

    return parsed as T;
  } catch (err) {
    console.warn(`[gameStorage] Storage read error for key '${key}':`, err);
    return defaultValue;
  }
}

/**
 * Safe local storage writer with envelope versioning and error handling.
 */
function safeWrite<T>(key: string, value: T): boolean {
  try {
    if (value === undefined) return false;
    const envelope: StorageVersionEnvelope<T> = {
      version: CURRENT_STORAGE_VERSION,
      timestamp: Date.now(),
      data: value,
    };
    setItemRaw(key, JSON.stringify(envelope));
    return true;
  } catch (err) {
    console.warn(`[gameStorage] Storage write error for key '${key}':`, err);
    return false;
  }
}

/**
 * Centralized Game Storage Utility
 */
export const gameStorage = {
  // Game State (Active board, score, moves, level)
  saveGameState: (state: GameState | null): void => {
    safeWrite(STORAGE_KEYS.GAME_STATE, state);
  },
  loadGameState: (): GameState | null => {
    return safeRead<GameState | null>(STORAGE_KEYS.GAME_STATE, null);
  },
  clearGameState: (): void => {
    removeItemRaw(STORAGE_KEYS.GAME_STATE);
  },
  hasSavedGame: (): boolean => {
    const state = gameStorage.loadGameState();
    return Boolean(
      state &&
      state.active &&
      !state.isGameOver &&
      !state.isChallengeComplete &&
      !state.isChallengeFailed
    );
  },

  // Settings
  saveSettings: (settings: SettingsState): void => {
    safeWrite(STORAGE_KEYS.SETTINGS, settings);
  },
  loadSettings: (): SettingsState => {
    return safeRead<SettingsState>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  // Records & Progression (Unlocked levels, completed levels, high scores)
  saveRecords: (records: RecordsState): void => {
    safeWrite(STORAGE_KEYS.RECORDS, records);
  },
  loadRecords: (): RecordsState => {
    return safeRead<RecordsState>(STORAGE_KEYS.RECORDS, DEFAULT_RECORDS);
  },

  // Stats
  saveStats: (stats: StatisticsState): void => {
    safeWrite(STORAGE_KEYS.STATS, stats);
  },
  loadStats: (): StatisticsState => {
    return safeRead<StatisticsState>(STORAGE_KEYS.STATS, DEFAULT_STATS);
  },

  // Tutorial State
  saveTutorial: (tutorial: TutorialState): void => {
    safeWrite(STORAGE_KEYS.TUTORIAL, tutorial);
  },
  loadTutorial: (): TutorialState => {
    return safeRead<TutorialState>(STORAGE_KEYS.TUTORIAL, DEFAULT_TUTORIAL);
  },

  // First-Time Intro Flags
  saveFirstTimeIntros: (intros: FirstTimeIntrosState): void => {
    safeWrite(STORAGE_KEYS.FIRST_TIME_INTROS, intros);
  },
  loadFirstTimeIntros: (): FirstTimeIntrosState => {
    return safeRead<FirstTimeIntrosState>(
      STORAGE_KEYS.FIRST_TIME_INTROS,
      DEFAULT_FIRST_TIME_INTROS
    );
  },

  // Reset progress
  resetAllProgress: (): void => {
    removeItemRaw(STORAGE_KEYS.SETTINGS);
    removeItemRaw(STORAGE_KEYS.RECORDS);
    removeItemRaw(STORAGE_KEYS.STATS);
    removeItemRaw(STORAGE_KEYS.TUTORIAL);
    removeItemRaw(STORAGE_KEYS.GAME_STATE);
    removeItemRaw(STORAGE_KEYS.FIRST_TIME_INTROS);
    removeItemRaw(STORAGE_KEYS.VERSION);
  },
};


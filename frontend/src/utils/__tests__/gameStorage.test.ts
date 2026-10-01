import { describe, it, expect, beforeEach } from 'vitest';
import {
  gameStorage,
  DEFAULT_SETTINGS,
  DEFAULT_RECORDS,
  DEFAULT_STATS,
} from '../gameStorage';
import { GameState } from '../../types/game';

describe('gameStorage Utility', () => {
  beforeEach(() => {
    gameStorage.resetAllProgress();
  });

  it('loads default settings when no save exists', () => {
    const settings = gameStorage.loadSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it('saves and loads settings correctly with versioning', () => {
    const updatedSettings = {
      ...DEFAULT_SETTINGS,
      theme: 'CYBER' as const,
      soundEnabled: false,
    };
    gameStorage.saveSettings(updatedSettings);

    const loaded = gameStorage.loadSettings();
    expect(loaded.theme).toBe('CYBER');
    expect(loaded.soundEnabled).toBe(false);
  });

  it('saves and loads records (level progress, high scores)', () => {
    const customRecords = {
      ...DEFAULT_RECORDS,
      classicBest: 4096,
      movesChallenge: {
        ...DEFAULT_RECORDS.movesChallenge,
        highestUnlockedLevel: 4,
        completedLevels: [1, 2, 3],
        bestMovesPerLevel: { 1: 15, 2: 20 },
        bestScorePerLevel: { 1: 500, 2: 1200 },
        attemptsCount: 5,
      },
    };

    gameStorage.saveRecords(customRecords);
    const loaded = gameStorage.loadRecords();

    expect(loaded.classicBest).toBe(4096);
    expect(loaded.movesChallenge.highestUnlockedLevel).toBe(4);
    expect(loaded.movesChallenge.completedLevels).toEqual([1, 2, 3]);
    expect(loaded.movesChallenge.bestMovesPerLevel[1]).toBe(15);
  });

  it('deep merges missing schema properties safely', () => {
    // Save partial data missing nested properties
    gameStorage.saveRecords({
      classicBest: 2048,
      movesChallenge: {
        highestUnlockedLevel: 2,
        completedLevels: [1],
      },
    } as any);

    const loaded = gameStorage.loadRecords();
    expect(loaded.classicBest).toBe(2048);
    expect(loaded.movesChallenge.highestUnlockedLevel).toBe(2);
    // Missing nested properties fallback to defaults, not undefined
    expect(loaded.movesChallenge.bestMovesPerLevel).toEqual({});
    expect(loaded.movesChallenge.attemptsCount).toBe(0);
    expect(loaded.hardcore.bestScore).toBe(0);
  });

  it('saves, loads, clears and checks active game state', () => {
    expect(gameStorage.hasSavedGame()).toBe(false);

    const mockGameState: GameState = {
      mode: 'CLASSIC',
      boardSize: 4,
      board: Array(4).fill(Array(4).fill(null)),
      score: 512,
      moves: 30,
      highestTile: 128,
      totalMerges: 25,
      timeRemaining: 0,
      isGameOver: false,
      isPaused: false,
      isWon: false,
      hasContinuedAfter2048: false,
      active: true,
    };

    gameStorage.saveGameState(mockGameState);
    expect(gameStorage.hasSavedGame()).toBe(true);

    const loaded = gameStorage.loadGameState();
    expect(loaded?.score).toBe(512);
    expect(loaded?.highestTile).toBe(128);

    gameStorage.clearGameState();
    expect(gameStorage.hasSavedGame()).toBe(false);
    expect(gameStorage.loadGameState()).toBeNull();
  });

  it('resets all progress on resetAllProgress call', () => {
    gameStorage.saveSettings({ ...DEFAULT_SETTINGS, soundEnabled: false });
    gameStorage.saveRecords({ ...DEFAULT_RECORDS, classicBest: 9999 });
    gameStorage.saveStats({ ...DEFAULT_STATS, totalScore: 50000 });

    gameStorage.resetAllProgress();

    expect(gameStorage.loadSettings()).toEqual(DEFAULT_SETTINGS);
    expect(gameStorage.loadRecords().classicBest).toBe(0);
    expect(gameStorage.loadStats().totalScore).toBe(0);
  });
});

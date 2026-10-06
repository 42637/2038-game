import React, { useState, useEffect, useCallback } from 'react';
import { GameBoard } from '../board/GameBoard';
import { GameHeader } from '../common/GameHeader';
import { ActionBar } from '../common/ActionBar';
import { DPadControls } from '../common/DPadControls';
import { ConfettiEffect } from '../common/ConfettiEffect';
import {
  ChallengeCompleteModal,
  ChallengeFailedModal,
  GameOverModal,
  PauseModal,
  RestartConfirmModal,
} from '../modals/Modals';
import {
  BoardSize,
  ChallengeLevel,
  DailyChallengeConfig,
  Direction,
  FloatingScore,
  GameMode,
  GameState,
  PowerupInventory,
  RecordsState,
  SettingsState,
  StatisticsState,
  Theme,
  UndoSnapshot,
} from '../../types/game';
import {
  moveBoard,
  spawnTile,
  hasValidMoves,
  getHighestTileOnBoard,
  initializeBoard,
  cloneBoard,
  hammerTile,
  shuffleBoard,
} from '../../game/engine';
import { CHALLENGE_LEVELS, GAME_MODE_CONFIGS, getMilestoneMessage } from '../../game/modeManager';
import { processSpecialTilesAfterMove, spawnSpecialTile } from '../../game/specialTileManager';
import { getTodayDateSeed } from '../../game/dailyChallengeGenerator';
import { audioService } from '../../services/audio';
import { hapticPatterns, triggerHaptic } from '../../services/haptics';
import { gameStorage } from '../../utils/gameStorage';
import { apiService } from '../../services/api';
import './GameplayScreen.css';

interface GameplayScreenProps {
  mode: GameMode;
  challengeLevel?: ChallengeLevel;
  dailyChallenge?: DailyChallengeConfig;
  settings: SettingsState;
  records: RecordsState;
  stats: StatisticsState;
  onUpdateSettings?: (newSettings: SettingsState) => void;
  onUpdateRecords: (newRecords: RecordsState) => void;
  onUpdateStats: (newStats: StatisticsState) => void;
  onSelectChallenge?: (level: ChallengeLevel) => void;
  onMainMenu: () => void;
}

export const GameplayScreen: React.FC<GameplayScreenProps> = ({
  mode,
  challengeLevel,
  dailyChallenge,
  settings,
  records,
  stats,
  onUpdateSettings,
  onUpdateRecords,
  onUpdateStats,
  onSelectChallenge,
  onMainMenu,
}) => {
  const modeConfig = GAME_MODE_CONFIGS[mode];
  const activeBoardSize: BoardSize =
    mode === 'MEGA_BOARD' ? (settings.boardSize >= 5 ? settings.boardSize : 5) : settings.boardSize || 4;

  const initialTargetTile =
    mode === 'MOVES_CHALLENGE'
      ? challengeLevel?.targetTile || 32
      : mode === 'DAILY_CHALLENGE'
        ? dailyChallenge?.targetTile
        : undefined;
  const initialMoveLimit =
    mode === 'MOVES_CHALLENGE'
      ? challengeLevel?.moveLimit || 30
      : mode === 'DAILY_CHALLENGE'
        ? dailyChallenge?.moveLimit
        : undefined;
  const initialTargetScore = mode === 'DAILY_CHALLENGE' ? dailyChallenge?.targetScore : undefined;

  // Load existing saved game state if matching mode/challenge, else init
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = gameStorage.loadGameState();
    if (
      saved &&
      saved.mode === mode &&
      saved.boardSize === activeBoardSize &&
      saved.challengeId === challengeLevel?.id &&
      saved.dailyDate === dailyChallenge?.dateSeed &&
      !saved.isGameOver &&
      !saved.isChallengeComplete &&
      !saved.isChallengeFailed &&
      saved.active
    ) {
      return {
        ...saved,
        undoStack: saved.undoStack || [],
        powerups: saved.powerups || { hammer: 3, shuffle: 3 },
      };
    }

    let board = initializeBoard(activeBoardSize);

    if (mode === 'BOMB') {
      const spawned = spawnSpecialTile(board, 'BOMB', activeBoardSize);
      board = spawned.board;
    } else if (mode === 'ICE') {
      const spawned = spawnSpecialTile(board, 'ICE', activeBoardSize);
      board = spawned.board;
    }

    return {
      mode,
      boardSize: activeBoardSize,
      board,
      score: 0,
      moves: 0,
      highestTile: 2,
      totalMerges: 0,
      timeRemaining: modeConfig.initialTimeRemaining,
      challengeId: challengeLevel?.id,
      targetTile: initialTargetTile,
      targetScore: initialTargetScore,
      moveLimit: initialMoveLimit,
      dailyDate: dailyChallenge?.dateSeed,
      bombsTriggered: 0,
      iceCleared: 0,
      isChallengeComplete: false,
      isChallengeFailed: false,
      isGameOver: false,
      isPaused: false,
      isWon: false,
      hasContinuedAfter2048: false,
      active: true,
      undoStack: [],
      powerups: { hammer: 3, shuffle: 3 },
    };
  });

  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'defuse' | 'penalty' | 'info' } | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [activeExplosions, setActiveExplosions] = useState<{
    bombPositions: { row: number; col: number }[];
    cellPositions: { row: number; col: number }[];
  } | null>(null);

  // New interactive states
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [isHammerActive, setIsHammerActive] = useState(false);
  const [showDPad, setShowDPad] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Determine current mode best score
  const getBestScore = (): number => {
    switch (mode) {
      case 'CLASSIC':
        return records.classicBest;
      case 'ENDLESS':
        return records.endlessBest;
      case 'TIME_ATTACK':
        return records.timeAttackBest;
      case 'HARDCORE':
        return records.hardcore.bestScore;
      case 'MEGA_BOARD':
        return records.megaBoard.bestScore;
      case 'BOMB':
        return records.bomb.bestScore;
      case 'ICE':
        return records.ice.bestScore;
      case 'DAILY_CHALLENGE':
        return records.daily.bestScore;
      case 'MOVES_CHALLENGE':
        return challengeLevel ? records.movesChallenge.bestScorePerLevel[challengeLevel.levelNumber] || 0 : 0;
    }
  };

  const currentBestScore = getBestScore();

  // Timer effect for Time Attack mode
  useEffect(() => {
    if (mode !== 'TIME_ATTACK' || gameState.isPaused || gameState.isGameOver) return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeRemaining <= 1) {
          clearInterval(timer);
          audioService.playGameOverSound(settings.soundEnabled);
          triggerHaptic(hapticPatterns.gameOver, settings.vibrationEnabled);
          return { ...prev, timeRemaining: 0, isGameOver: true };
        }
        if (prev.timeRemaining <= 6) {
          audioService.playTimeWarningSound(settings.soundEnabled);
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, gameState.isPaused, gameState.isGameOver, settings.soundEnabled, settings.vibrationEnabled]);

  // Save game state locally and listen for app background / hide events
  useEffect(() => {
    gameStorage.saveGameState(gameState);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        gameStorage.saveGameState(gameState);
      }
    };

    window.addEventListener('beforeunload', () => gameStorage.saveGameState(gameState));
    window.addEventListener('pagehide', () => gameStorage.saveGameState(gameState));
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', () => gameStorage.saveGameState(gameState));
      window.removeEventListener('pagehide', () => gameStorage.saveGameState(gameState));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gameState]);

  // Handle Swipe Gesture
  const handleSwipe = useCallback(
    (direction: Direction) => {
      setGameState((prev) => {
        if (prev.isGameOver || prev.isPaused || prev.isChallengeComplete || prev.isChallengeFailed) {
          return prev;
        }

        const currentSize = prev.boardSize || activeBoardSize;
        const result = moveBoard(prev.board, direction, currentSize);

        // Invalid moves do NOT consume moves or change board
        if (!result.moved) return prev;

        // Push previous state to undo stack (max 5 depth)
        const snapshot: UndoSnapshot = {
          board: cloneBoard(prev.board),
          score: prev.score,
          moves: prev.moves,
          highestTile: prev.highestTile,
        };
        const updatedUndoStack = [snapshot, ...(prev.undoStack || [])].slice(0, 5);

        // Spawn floating score popups on merges
        if (result.mergedCoords && result.mergedCoords.length > 0) {
          const newFS: FloatingScore[] = result.mergedCoords.map((mc, idx) => ({
            id: `fs_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
            score: mc.score,
            row: mc.row,
            col: mc.col,
          }));
          setFloatingScores((existing) => [...existing, ...newFS]);
          setTimeout(() => {
            setFloatingScores((existing) => existing.filter((f) => !newFS.some((n) => n.id === f.id)));
          }, 850);
        }

        // Tile spawn logic (chance of special tile in BOMB or ICE mode)
        let nextBoard = result.board;
        let spawnedSpecial: 'BOMB' | 'ICE' | null = null;

        const hasBombOnBoard = nextBoard.some((r) => r.some((c) => c?.specialType === 'BOMB'));
        const hasIceOnBoard = nextBoard.some((r) => r.some((c) => c?.specialType === 'ICE' && c.isFrozen));

        if (mode === 'BOMB' && !hasBombOnBoard && Math.random() < 0.35) {
          const bombSpawn = spawnSpecialTile(nextBoard, 'BOMB', currentSize);
          if (bombSpawn.newTile) {
            nextBoard = bombSpawn.board;
            spawnedSpecial = 'BOMB';
          }
        } else if (mode === 'ICE' && !hasIceOnBoard && Math.random() < 0.35) {
          const iceSpawn = spawnSpecialTile(nextBoard, 'ICE', currentSize);
          if (iceSpawn.newTile) {
            nextBoard = iceSpawn.board;
            spawnedSpecial = 'ICE';
          }
        }

        if (!spawnedSpecial) {
          const spawn = spawnTile(nextBoard, currentSize);
          nextBoard = spawn.board;
        }

        // Track merged cells for Bomb & Ice processing
        const mergedPositions: { row: number; col: number }[] = [];
        for (let r = 0; r < currentSize; r++) {
          for (let c = 0; c < currentSize; c++) {
            const tile = nextBoard[r]?.[c];
            if (tile && tile.isMerged) {
              mergedPositions.push({ row: r, col: c });
            }
          }
        }

        // Process Special Tile interactions (Bomb detonations & Ice unfreezing)
        const specialResult = processSpecialTilesAfterMove(nextBoard, mergedPositions, currentSize);
        nextBoard = specialResult.board;

        const newScore = Math.max(0, prev.score + result.scoreGained + specialResult.pointsGained);
        const newMoves = prev.moves + 1;
        const newMerges = prev.totalMerges + result.mergesCount;
        const newHighestTile = Math.max(prev.highestTile, getHighestTileOnBoard(nextBoard));
        const newBombsTriggered = (prev.bombsTriggered || 0) + specialResult.bombsDetonatedCount + specialResult.bombsDefusedCount;
        const newIceCleared = (prev.iceCleared || 0) + specialResult.iceUnfrozenCount;

        // Audio & Haptic feedback for special events
        if (specialResult.bombsDefusedCount > 0) {
          audioService.playBombSound(settings.soundEnabled);
          triggerHaptic(hapticPatterns.bomb, settings.vibrationEnabled);
          setToastMessage({ text: `💣 Bomb Defused! +300 PTS Bonus`, type: 'defuse' });
          setTimeout(() => setToastMessage(null), 1600);
        } else if (specialResult.bombsDetonatedCount > 0) {
          audioService.playBombSound(settings.soundEnabled);
          triggerHaptic(hapticPatterns.bomb, settings.vibrationEnabled);
          setToastMessage({ text: `💥 Bomb Blasted! -200 PTS Penalty`, type: 'penalty' });
          setActiveExplosions({
            bombPositions: specialResult.detonatedBombPositions,
            cellPositions: specialResult.explodedTilePositions,
          });
          setTimeout(() => setActiveExplosions(null), 850);
          setTimeout(() => setToastMessage(null), 1600);
        } else if (specialResult.iceUnfrozenCount > 0) {
          audioService.playIceBreakSound(settings.soundEnabled);
          triggerHaptic(hapticPatterns.iceBreak, settings.vibrationEnabled);
          setToastMessage({ text: '🧊 Ice Broken!', type: 'info' });
          setTimeout(() => setToastMessage(null), 1500);
        } else if (result.mergesCount > 0) {
          audioService.playMergeSoundForValue(result.highestTileMerged, settings.soundEnabled);
          if (result.highestTileMerged >= 128) {
            triggerHaptic(hapticPatterns.largeMerge, settings.vibrationEnabled);
          } else {
            triggerHaptic(hapticPatterns.smallMerge, settings.vibrationEnabled);
          }
        } else {
          audioService.playMoveSound(settings.soundEnabled);
          triggerHaptic(hapticPatterns.move, settings.vibrationEnabled);
        }

        // Time Attack Bonus Time Calculation
        let timeBonus = 0;
        if (mode === 'TIME_ATTACK' && result.mergesCount > 0 && modeConfig.calculateTimeBonus) {
          timeBonus = modeConfig.calculateTimeBonus(result.highestTileMerged, result.mergesCount);
        }

        // Check Milestone feedback
        const milestone = getMilestoneMessage(result.highestTileMerged);
        if (milestone) {
          setToastMessage({ text: milestone, type: 'info' });
          audioService.playMilestoneSound(settings.soundEnabled);
          triggerHaptic(hapticPatterns.milestone, settings.vibrationEnabled);
          setTimeout(() => setToastMessage(null), 1800);
        } else if (timeBonus > 0) {
          setToastMessage({ text: `+${timeBonus}s Bonus!`, type: 'info' });
          setTimeout(() => setToastMessage(null), 1200);
        }

        // Challenge Win & Failure Conditions (Moves Challenge & Daily Challenge)
        let challengeComplete = false;
        let challengeFailed = false;

        if (mode === 'MOVES_CHALLENGE' && prev.targetTile && prev.moveLimit) {
          if (newHighestTile >= prev.targetTile) {
            challengeComplete = true;
            audioService.playChallengeCompleteSound(settings.soundEnabled);
            triggerHaptic(hapticPatterns.challengeComplete, settings.vibrationEnabled);

            apiService.submitScore({
              mode: 'MOVES_CHALLENGE',
              score: newScore,
              highestTile: newHighestTile,
              moves: newMoves,
              challengeLevelId: challengeLevel?.id,
            });

            if (challengeLevel) {
              const currentLvl = challengeLevel.levelNumber;
              const nextUnlocked = Math.max(records.movesChallenge.highestUnlockedLevel, currentLvl + 1);
              const completedSet = Array.from(
                new Set([...records.movesChallenge.completedLevels, currentLvl])
              );
              const currentBestMoves = records.movesChallenge.bestMovesPerLevel[currentLvl];
              const updatedBestMoves = currentBestMoves
                ? Math.min(currentBestMoves, newMoves)
                : newMoves;

              const updatedRecords: RecordsState = {
                ...records,
                movesChallenge: {
                  ...records.movesChallenge,
                  highestUnlockedLevel: nextUnlocked,
                  completedLevels: completedSet,
                  bestMovesPerLevel: {
                    ...records.movesChallenge.bestMovesPerLevel,
                    [currentLvl]: updatedBestMoves,
                  },
                  bestScorePerLevel: {
                    ...records.movesChallenge.bestScorePerLevel,
                    [currentLvl]: Math.max(
                      records.movesChallenge.bestScorePerLevel[currentLvl] || 0,
                      newScore
                    ),
                  },
                },
              };

              const updatedStats: StatisticsState = {
                ...stats,
                totalScore: stats.totalScore + newScore,
                totalMerges: stats.totalMerges + newMerges,
                highestTile: Math.max(stats.highestTile, newHighestTile),
                movesChallengeCompleted: stats.movesChallengeCompleted + 1,
              };

              queueMicrotask(() => {
                onUpdateRecords(updatedRecords);
                onUpdateStats(updatedStats);
              });
            }
          } else if (newMoves >= prev.moveLimit) {
            challengeFailed = true;
            audioService.playChallengeFailedSound(settings.soundEnabled);
            triggerHaptic(hapticPatterns.challengeFailed, settings.vibrationEnabled);

            const updatedStats: StatisticsState = {
              ...stats,
              movesChallengeAttempts: stats.movesChallengeAttempts + 1,
            };
            queueMicrotask(() => onUpdateStats(updatedStats));
          }
        } else if (mode === 'DAILY_CHALLENGE' && (prev.targetTile || prev.targetScore) && prev.moveLimit) {
          const isTargetReached = prev.targetTile
            ? newHighestTile >= prev.targetTile
            : (prev.targetScore && newScore >= prev.targetScore) || false;

          if (isTargetReached) {
            challengeComplete = true;
            audioService.playStreakSound(settings.soundEnabled);
            triggerHaptic(hapticPatterns.streakMilestone, settings.vibrationEnabled);

            const todaySeed = dailyChallenge?.dateSeed || getTodayDateSeed();
            const currentStreak = records.daily.streak.currentStreak + 1;
            const bestStreak = Math.max(records.daily.streak.bestStreak, currentStreak);

            const updatedRecords: RecordsState = {
              ...records,
              daily: {
                ...records.daily,
                bestScore: Math.max(records.daily.bestScore, newScore),
                highestTile: Math.max(records.daily.highestTile, newHighestTile),
                challengesCompleted: records.daily.challengesCompleted + 1,
                streak: {
                  ...records.daily.streak,
                  currentStreak,
                  bestStreak,
                  lastCompletedDate: todaySeed,
                },
                history: {
                  ...records.daily.history,
                  [todaySeed]: {
                    date: todaySeed,
                    completed: true,
                    score: newScore,
                    moves: newMoves,
                    highestTile: newHighestTile,
                  },
                },
              },
            };

            const updatedStats: StatisticsState = {
              ...stats,
              dailyCompleted: stats.dailyCompleted + 1,
              dailyBestScore: Math.max(stats.dailyBestScore, newScore),
              currentDailyStreak: currentStreak,
              bestDailyStreak: bestStreak,
            };

            queueMicrotask(() => {
              onUpdateRecords(updatedRecords);
              onUpdateStats(updatedStats);
            });
          } else if (newMoves >= prev.moveLimit) {
            challengeFailed = true;
            audioService.playChallengeFailedSound(settings.soundEnabled);
            triggerHaptic(hapticPatterns.challengeFailed, settings.vibrationEnabled);

            const updatedStats: StatisticsState = {
              ...stats,
              dailyAttempted: stats.dailyAttempted + 1,
            };
            queueMicrotask(() => onUpdateStats(updatedStats));
          }
        }

        // Standard New Record check
        if (newScore > currentBestScore && mode !== 'MOVES_CHALLENGE' && mode !== 'DAILY_CHALLENGE') {
          setIsNewBest(true);
          const updatedRecords = { ...records };

          if (mode === 'CLASSIC') {
            updatedRecords.classicBest = newScore;
            updatedRecords.classicHighestTile = Math.max(records.classicHighestTile, newHighestTile);
          } else if (mode === 'ENDLESS') {
            updatedRecords.endlessBest = newScore;
            updatedRecords.endlessHighestTile = Math.max(records.endlessHighestTile, newHighestTile);
          } else if (mode === 'TIME_ATTACK') {
            updatedRecords.timeAttackBest = newScore;
            updatedRecords.timeAttackHighestTile = Math.max(records.timeAttackHighestTile, newHighestTile);
          } else if (mode === 'HARDCORE') {
            updatedRecords.hardcore = {
              ...records.hardcore,
              bestScore: newScore,
              highestTile: Math.max(records.hardcore.highestTile, newHighestTile),
              bestMoves: newMoves,
            };
          } else if (mode === 'MEGA_BOARD') {
            updatedRecords.megaBoard = {
              ...records.megaBoard,
              bestScore: newScore,
              highestTile: Math.max(records.megaBoard.highestTile, newHighestTile),
              bestMoves: newMoves,
            };
          } else if (mode === 'BOMB') {
            updatedRecords.bomb = {
              ...records.bomb,
              bestScore: newScore,
              highestTile: Math.max(records.bomb.highestTile, newHighestTile),
              bestMoves: newMoves,
              bombsTriggered: newBombsTriggered,
            };
          } else if (mode === 'ICE') {
            updatedRecords.ice = {
              ...records.ice,
              bestScore: newScore,
              highestTile: Math.max(records.ice.highestTile, newHighestTile),
              bestMoves: newMoves,
              iceCleared: newIceCleared,
            };
          }

          apiService.submitScore({
            mode,
            score: newScore,
            highestTile: newHighestTile,
            moves: newMoves,
          });

          queueMicrotask(() => onUpdateRecords(updatedRecords));
        }

        // Check Game Over condition
        const isOver = !hasValidMoves(nextBoard, currentSize);
        if (isOver && !challengeComplete && !challengeFailed) {
          audioService.playGameOverSound(settings.soundEnabled);
          triggerHaptic(hapticPatterns.gameOver, settings.vibrationEnabled);

          apiService.submitScore({
            mode,
            score: newScore,
            highestTile: newHighestTile,
            moves: newMoves,
          });

          const updatedStats: StatisticsState = {
            ...stats,
            gamesPlayed: stats.gamesPlayed + 1,
            totalScore: stats.totalScore + newScore,
            totalMerges: stats.totalMerges + newMerges,
            highestTile: Math.max(stats.highestTile, newHighestTile),
            classicGames: mode === 'CLASSIC' ? stats.classicGames + 1 : stats.classicGames,
            endlessGames: mode === 'ENDLESS' ? stats.endlessGames + 1 : stats.endlessGames,
            timeAttackGames: mode === 'TIME_ATTACK' ? stats.timeAttackGames + 1 : stats.timeAttackGames,
            hardcoreGames: mode === 'HARDCORE' ? stats.hardcoreGames + 1 : stats.hardcoreGames,
            hardcoreHighestTile: mode === 'HARDCORE' ? Math.max(stats.hardcoreHighestTile, newHighestTile) : stats.hardcoreHighestTile,
            megaBoardGames: mode === 'MEGA_BOARD' ? stats.megaBoardGames + 1 : stats.megaBoardGames,
            megaBoardHighestTile: mode === 'MEGA_BOARD' ? Math.max(stats.megaBoardHighestTile, newHighestTile) : stats.megaBoardHighestTile,
            megaBoardBestScore: mode === 'MEGA_BOARD' ? Math.max(stats.megaBoardBestScore, newScore) : stats.megaBoardBestScore,
            bombGames: mode === 'BOMB' ? stats.bombGames + 1 : stats.bombGames,
            bombsTriggered: stats.bombsTriggered + specialResult.bombsDetonatedCount,
            bombBestScore: mode === 'BOMB' ? Math.max(stats.bombBestScore, newScore) : stats.bombBestScore,
            iceGames: mode === 'ICE' ? stats.iceGames + 1 : stats.iceGames,
            iceCleared: stats.iceCleared + specialResult.iceUnfrozenCount,
            iceBestScore: mode === 'ICE' ? Math.max(stats.iceBestScore, newScore) : stats.iceBestScore,
          };
          queueMicrotask(() => onUpdateStats(updatedStats));
        }

        const isFirst2048 = !prev.isWon && newHighestTile >= 2048;

        if (challengeComplete || isFirst2048 || (isOver && isNewBest)) {
          setShowConfetti(true);
        }

        return {
          ...prev,
          board: nextBoard,
          score: newScore,
          moves: newMoves,
          highestTile: newHighestTile,
          totalMerges: newMerges,
          bombsTriggered: newBombsTriggered,
          iceCleared: newIceCleared,
          timeRemaining: mode === 'TIME_ATTACK' ? prev.timeRemaining + timeBonus : prev.timeRemaining,
          isChallengeComplete: challengeComplete,
          isChallengeFailed: challengeFailed,
          isGameOver: isOver && !challengeComplete,
          isWon: prev.isWon || newHighestTile >= 2048,
          undoStack: updatedUndoStack,
        };
      });
    },
    [
      mode,
      activeBoardSize,
      challengeLevel,
      dailyChallenge,
      modeConfig,
      settings,
      records,
      stats,
      currentBestScore,
      onUpdateRecords,
      onUpdateStats,
    ]
  );

  // Powerup & Interaction Handlers
  const handleUndo = () => {
    setGameState((prev) => {
      const stack = prev.undoStack || [];
      if (stack.length === 0) return prev;
      const [last, ...rest] = stack;
      audioService.playUndoSound(settings.soundEnabled);
      triggerHaptic(hapticPatterns.move, settings.vibrationEnabled);
      return {
        ...prev,
        board: last.board,
        score: last.score,
        moves: last.moves,
        highestTile: last.highestTile,
        undoStack: rest,
      };
    });
  };

  const handleToggleHammer = () => {
    const count = gameState.powerups?.hammer || 0;
    if (count <= 0) return;
    setIsHammerActive((prev) => !prev);
  };

  const handleHammerTile = (r: number, c: number) => {
    const currentHammer = gameState.powerups?.hammer || 0;
    if (currentHammer <= 0 || !gameState.board[r]?.[c]) return;

    // Snapshot board state before smashing for undo history
    const currentStateSnapshot = {
      board: cloneBoard(gameState.board),
      score: gameState.score,
      moves: gameState.moves,
      highestTile: gameState.highestTile,
    };

    const newBoard = hammerTile(gameState.board, r, c);
    audioService.playHammerSound(settings.soundEnabled);
    triggerHaptic(hapticPatterns.bomb, settings.vibrationEnabled);

    // Trigger visual explosion blast particle effect on target cell
    setActiveExplosions({
      bombPositions: [{ row: r, col: c }],
      cellPositions: [{ row: r, col: c }],
    });
    setTimeout(() => setActiveExplosions(null), 450);

    setIsHammerActive(false);

    setGameState((prev) => ({
      ...prev,
      board: newBoard,
      undoStack: [currentStateSnapshot, ...(prev.undoStack || []).slice(0, 9)],
      powerups: {
        ...prev.powerups!,
        hammer: Math.max(0, currentHammer - 1),
      },
    }));
  };

  const handleShuffle = () => {
    setGameState((prev) => {
      const currentShuffle = prev.powerups?.shuffle || 0;
      if (currentShuffle <= 0) return prev;
      const newBoard = shuffleBoard(prev.board, activeBoardSize);
      audioService.playShuffleSound(settings.soundEnabled);
      triggerHaptic(hapticPatterns.move, settings.vibrationEnabled);
      return {
        ...prev,
        board: newBoard,
        powerups: {
          ...prev.powerups!,
          shuffle: currentShuffle - 1,
        },
      };
    });
  };

  const handleCycleTheme = () => {
    const themes: Theme[] = ['CLASSIC', 'DARK', 'CYBER', 'ICE', 'SUNSET'];
    const current = settings.theme || 'CLASSIC';
    const nextIdx = (themes.indexOf(current) + 1) % themes.length;
    const nextTheme = themes[nextIdx];
    const updated = { ...settings, theme: nextTheme };
    gameStorage.saveSettings(updated);
    if (onUpdateSettings) {
      onUpdateSettings(updated);
    }
  };

  const handlePause = () => {
    setGameState((prev) => ({ ...prev, isPaused: true }));
  };

  const handleResume = () => {
    setGameState((prev) => ({ ...prev, isPaused: false }));
  };

  const handleRequestRestart = () => {
    setShowRestartConfirm(true);
  };

  const handleConfirmRestart = () => {
    setShowRestartConfirm(false);
    setIsNewBest(false);
    setShowConfetti(false);
    setIsHammerActive(false);
    let newBoard = initializeBoard(activeBoardSize);

    if (mode === 'BOMB') {
      newBoard = spawnSpecialTile(newBoard, 'BOMB', activeBoardSize).board;
    } else if (mode === 'ICE') {
      newBoard = spawnSpecialTile(newBoard, 'ICE', activeBoardSize).board;
    }

    setGameState({
      mode,
      boardSize: activeBoardSize,
      board: newBoard,
      score: 0,
      moves: 0,
      highestTile: 2,
      totalMerges: 0,
      timeRemaining: modeConfig.initialTimeRemaining,
      challengeId: challengeLevel?.id,
      targetTile: initialTargetTile,
      targetScore: initialTargetScore,
      moveLimit: initialMoveLimit,
      dailyDate: dailyChallenge?.dateSeed,
      bombsTriggered: 0,
      iceCleared: 0,
      isChallengeComplete: false,
      isChallengeFailed: false,
      isGameOver: false,
      isPaused: false,
      isWon: false,
      hasContinuedAfter2048: false,
      active: true,
      undoStack: [],
      powerups: { hammer: 3, shuffle: 3 },
    });
  };

  const handleNextChallenge = () => {
    if (!challengeLevel || !onSelectChallenge) return;
    const nextLevel = CHALLENGE_LEVELS.find((l) => l.levelNumber === challengeLevel.levelNumber + 1);
    if (nextLevel) {
      onSelectChallenge(nextLevel);
    } else {
      onMainMenu();
    }
  };

  const hasNextLevel = Boolean(
    challengeLevel &&
    CHALLENGE_LEVELS.some((l) => l.levelNumber === challengeLevel.levelNumber + 1)
  );

  const canUndo = Boolean(gameState.undoStack && gameState.undoStack.length > 0);
  const undoCount = gameState.undoStack?.length || 0;
  const hammerCount = gameState.powerups?.hammer || 0;
  const shuffleCount = gameState.powerups?.shuffle || 0;

  return (
    <div className="screen gameplay-screen">
      {/* Confetti Celebration Overlay */}
      {showConfetti && <ConfettiEffect durationMs={3000} onFinish={() => setShowConfetti(false)} />}

      {/* Milestone Toast Overlay */}
      {toastMessage && (
        <div className={`milestone-toast ${toastMessage.type ? `toast-${toastMessage.type}` : ''}`}>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Gameplay Header */}
      <GameHeader
        mode={mode}
        boardSize={gameState.boardSize || activeBoardSize}
        score={gameState.score}
        bestScore={currentBestScore}
        highestTile={gameState.highestTile}
        moves={gameState.moves}
        moveLimit={gameState.moveLimit}
        targetTile={gameState.targetTile}
        timeRemaining={mode === 'TIME_ATTACK' ? gameState.timeRemaining : undefined}
        currentTheme={settings.theme}
        onCycleTheme={handleCycleTheme}
        onRestart={handleRequestRestart}
        onPause={handlePause}
      />

      {/* Main Square Board */}
      <GameBoard
        board={gameState.board}
        boardSize={gameState.boardSize || activeBoardSize}
        onSwipe={handleSwipe}
        floatingScores={floatingScores}
        isHammerActive={isHammerActive}
        onHammerTile={handleHammerTile}
        onToggleHammer={handleToggleHammer}
        explosions={activeExplosions}
        disabled={
          gameState.isPaused ||
          gameState.isGameOver ||
          gameState.isChallengeComplete ||
          gameState.isChallengeFailed ||
          showRestartConfirm
        }
      />

      {/* Interactive Action Bar (Undo, Hammer, Shuffle, D-Pad) */}
      <ActionBar
        canUndo={canUndo}
        undoCount={undoCount}
        onUndo={handleUndo}
        hammerCount={hammerCount}
        isHammerActive={isHammerActive}
        onToggleHammer={handleToggleHammer}
        shuffleCount={shuffleCount}
        onShuffle={handleShuffle}
        showDPad={showDPad}
        onToggleDPad={() => setShowDPad((prev) => !prev)}
        disabled={
          gameState.isPaused ||
          gameState.isGameOver ||
          gameState.isChallengeComplete ||
          gameState.isChallengeFailed ||
          showRestartConfirm
        }
      />

      {/* Optional Touch D-Pad Controls */}
      {showDPad && (
        <DPadControls
          onSwipe={handleSwipe}
          disabled={
            gameState.isPaused ||
            gameState.isGameOver ||
            gameState.isChallengeComplete ||
            gameState.isChallengeFailed ||
            showRestartConfirm ||
            isHammerActive
          }
        />
      )}

      {/* Modals */}
      {gameState.isPaused && !showRestartConfirm && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRequestRestart}
          onMainMenu={onMainMenu}
        />
      )}

      {showRestartConfirm && (
        <RestartConfirmModal
          onConfirm={handleConfirmRestart}
          onCancel={() => setShowRestartConfirm(false)}
        />
      )}

      {gameState.isChallengeComplete && (
        <ChallengeCompleteModal
          targetTile={gameState.targetTile || 32}
          movesUsed={gameState.moves}
          moveLimit={gameState.moveLimit || 30}
          score={gameState.score}
          highestTile={gameState.highestTile}
          hasNextChallenge={mode === 'MOVES_CHALLENGE' && hasNextLevel}
          onNextChallenge={handleNextChallenge}
          onRetry={handleConfirmRestart}
          onMainMenu={onMainMenu}
        />
      )}

      {gameState.isChallengeFailed && (
        <ChallengeFailedModal
          targetTile={gameState.targetTile || 32}
          movesUsed={gameState.moves}
          moveLimit={gameState.moveLimit || 30}
          highestTile={gameState.highestTile}
          onRetry={handleConfirmRestart}
          onMainMenu={onMainMenu}
        />
      )}

      {gameState.isGameOver && !gameState.isChallengeComplete && !gameState.isChallengeFailed && (
        <GameOverModal
          score={gameState.score}
          bestScore={currentBestScore}
          highestTile={gameState.highestTile}
          moves={gameState.moves}
          isNewBest={isNewBest}
          onTryAgain={handleConfirmRestart}
          onMainMenu={onMainMenu}
        />
      )}
    </div>
  );
};

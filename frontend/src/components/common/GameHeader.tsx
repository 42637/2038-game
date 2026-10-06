import React from 'react';
import { Home, Settings, Flame, Snowflake } from 'lucide-react';
import { BoardSize, GameMode, Theme } from '../../types/game';
import './GameHeader.css';

interface GameHeaderProps {
  mode: GameMode;
  boardSize?: BoardSize;
  score: number;
  bestScore: number;
  highestTile: number;
  moves?: number;
  moveLimit?: number;
  targetTile?: number;
  timeRemaining?: number;
  currentTheme?: Theme;
  onCycleTheme?: () => void;
  onRestart?: () => void;
  onPause: () => void;
  onMainMenu?: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  mode,
  boardSize = 4,
  score,
  bestScore,
  highestTile,
  moves = 0,
  moveLimit,
  targetTile,
  timeRemaining,
  currentTheme = 'CLASSIC',
  onCycleTheme,
  onRestart,
  onPause,
  onMainMenu,
}) => {
  const getModeLabel = (m: GameMode): string => {
    switch (m) {
      case 'CLASSIC':
        return 'CLASSIC';
      case 'ENDLESS':
        return 'ENDLESS';
      case 'TIME_ATTACK':
        return 'TIME ATTACK';
      case 'MOVES_CHALLENGE':
        return 'CHALLENGE';
      case 'HARDCORE':
        return 'HARDCORE';
      case 'MEGA_BOARD':
        return 'MEGA BOARD';
      case 'BOMB':
        return 'BOMB MODE';
      case 'ICE':
        return 'ICE MODE';
      case 'DAILY_CHALLENGE':
        return 'DAILY';
    }
  };

  // Calculate move limit warning state for Moves Challenge
  let movesClass = '';
  if (mode === 'MOVES_CHALLENGE' && moveLimit && moveLimit > 0) {
    const remaining = moveLimit - moves;
    const pct = remaining / moveLimit;
    if (pct <= 0.1) {
      movesClass = 'moves-danger';
    } else if (pct <= 0.2) {
      movesClass = 'moves-warning';
    }
  }

  return (
    <header className="game-header">
      {/* Top Action Header Navigation Bar */}
      <div className="header-top">
        {/* Left Home Button */}
        <button
          className="header-pill-btn home-btn"
          onClick={onMainMenu}
          title="Home / Main Menu"
          aria-label="Main Menu"
        >
          <Home size={22} className="header-btn-icon" />
        </button>

        {/* Center Title & Board Size Pill */}
        <div className="header-center-title-group">
          <div className="title-with-rays">
            <span className="title-ray left-ray">
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="2" y1="7" x2="8" y2="7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="4" y1="2" x2="10" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="4" y1="12" x2="10" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <h1 className="game-mode-heading">{getModeLabel(mode)}</h1>
            <span className="title-ray right-ray">
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="16" y1="7" x2="10" y2="7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="14" y1="2" x2="8" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="14" y1="12" x2="8" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </div>

          <div className="board-size-pill">
            <span>{boardSize}×{boardSize}</span>
          </div>
        </div>

        {/* Right Settings Gear Button */}
        <button
          className="header-pill-btn settings-btn"
          onClick={onPause}
          title="Settings / Pause"
          aria-label="Settings"
        >
          <Settings size={22} className="header-btn-icon" />
        </button>
      </div>

      {/* Mode Specific Hints */}
      {mode === 'BOMB' && (
        <div className="mode-hint-bar bomb-hint-bar">
          <Flame size={14} className="hint-icon" />
          <span>Merge adjacent tiles to DEFUSE (+300 PTS)! If fuse hits 0, bomb EXPLODES (-200 PTS).</span>
        </div>
      )}

      {mode === 'ICE' && (
        <div className="mode-hint-bar ice-hint-bar">
          <Snowflake size={14} className="hint-icon" />
          <span>Perform 3 adjacent merges near frozen tiles to shatter ice!</span>
        </div>
      )}

      {/* Score Cards Row */}
      {mode === 'MOVES_CHALLENGE' && targetTile && moveLimit ? (
        <div className="stats-row">
          <div className="stat-card target-card">
            <span className="stat-label">TARGET</span>
            <span className="stat-value text-accent-target">{targetTile}</span>
          </div>

          <div className={`stat-card moves-card ${movesClass}`}>
            <span className="stat-label">MOVES</span>
            <span className="stat-value">
              {moves}/{moveLimit}
            </span>
          </div>

          <div className="stat-card score-card">
            <span className="stat-label">SCORE</span>
            <span className="stat-value">{score.toLocaleString()}</span>
          </div>
        </div>
      ) : (
        <div className="stats-row">
          <div className="stat-card score-card">
            <span className="stat-label">SCORE</span>
            <span className="stat-value">{score.toLocaleString()}</span>
          </div>

          <div className="stat-card best-card">
            <span className="stat-label">BEST</span>
            <span className="stat-value">{bestScore.toLocaleString()}</span>
          </div>

          <div className="stat-card tile-card">
            <span className="stat-label">HIGHEST</span>
            <span className="stat-value">{highestTile}</span>
          </div>

          {mode === 'TIME_ATTACK' && timeRemaining !== undefined && (
            <div className={`stat-card timer-card ${timeRemaining <= 10 ? 'timer-warning' : ''}`}>
              <span className="stat-label">TIME</span>
              <span className="stat-value">{timeRemaining}s</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
};


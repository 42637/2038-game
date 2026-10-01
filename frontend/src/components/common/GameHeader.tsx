import React from 'react';
import { Pause, Flame, Snowflake, Palette, RotateCcw } from 'lucide-react';
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
}) => {
  const getModeLabel = (m: GameMode): string => {
    switch (m) {
      case 'CLASSIC':
        return 'Classic';
      case 'ENDLESS':
        return 'Endless';
      case 'TIME_ATTACK':
        return 'Time Attack';
      case 'MOVES_CHALLENGE':
        return 'Challenge';
      case 'HARDCORE':
        return 'Hardcore';
      case 'MEGA_BOARD':
        return 'Mega Board';
      case 'BOMB':
        return 'Bomb Mode';
      case 'ICE':
        return 'Ice Mode';
      case 'DAILY_CHALLENGE':
        return 'Daily Challenge';
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
      <div className="header-top">
        <div className="mode-badge">
          <span className="mode-dot" />
          <span className="mode-name">
            {getModeLabel(mode)} • {boardSize}×{boardSize}
          </span>
        </div>

        <div className="header-actions">
          {onRestart && (
            <button
              className="btn btn-icon restart-btn"
              onClick={onRestart}
              title="New Game"
              aria-label="New Game"
            >
              <RotateCcw size={19} />
            </button>
          )}

          {onCycleTheme && (
            <button
              className="btn btn-icon theme-btn"
              onClick={onCycleTheme}
              title={`Theme: ${currentTheme}`}
              aria-label="Cycle Theme"
            >
              <Palette size={20} />
            </button>
          )}

          <button className="btn btn-icon pause-btn" onClick={onPause} aria-label="Pause Game">
            <Pause size={22} />
          </button>
        </div>
      </div>

      {mode === 'BOMB' && (
        <div className="mode-hint-bar bomb-hint-bar">
          <Flame size={14} className="hint-icon" />
          <span>Merge adjacent tiles to DEFUSE (+300 PTS)! If 2-move fuse hits 0, bomb EXPLODES (-200 PTS Penalty).</span>
        </div>
      )}

      {mode === 'ICE' && (
        <div className="mode-hint-bar ice-hint-bar">
          <Snowflake size={14} className="hint-icon" />
          <span>Perform 3 adjacent merges near frozen tiles to shatter ice!</span>
        </div>
      )}

      {mode === 'MOVES_CHALLENGE' && targetTile && moveLimit ? (
        /* Moves Challenge Specific Header Layout */
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
        /* Standard Header Layout */
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

import React from 'react';
import {
  Play,
  Infinity as InfinityIcon,
  Timer,
  Target,
  ShieldAlert,
  Grid3X3,
  Trophy,
  BarChart3,
  HelpCircle,
  Settings as SettingsIcon,
  Info,
  Bomb,
  Snowflake,
  Calendar,
} from 'lucide-react';
import { ActiveScreen, BoardSize, GameMode, RecordsState } from '../../types/game';
import './MainMenu.css';

interface MainMenuProps {
  records: RecordsState;
  boardSize: BoardSize;
  onSelectBoardSize: (size: BoardSize) => void;
  onSelectMode: (mode: GameMode) => void;
  onNavigate: (screen: ActiveScreen) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  records,
  boardSize,
  onSelectBoardSize,
  onSelectMode,
  onNavigate,
}) => {
  // Determine overall best score and highest tile
  const globalBestScore = Math.max(
    records.classicBest,
    records.endlessBest,
    records.timeAttackBest,
    records.hardcore?.bestScore || 0,
    records.megaBoard?.bestScore || 0,
    records.bomb?.bestScore || 0,
    records.ice?.bestScore || 0
  );
  const globalHighestTile = Math.max(
    records.classicHighestTile,
    records.endlessHighestTile,
    records.timeAttackHighestTile,
    records.hardcore?.highestTile || 0,
    records.megaBoard?.highestTile || 0,
    records.bomb?.highestTile || 0,
    records.ice?.highestTile || 0
  );

  return (
    <div className="screen menu-screen">
      {/* Header */}
      <header className="menu-header">
        <div className="menu-title-block">
          <h1 className="menu-app-title">Merge 2048</h1>
          <span className="offline-badge">OFFLINE PUZZLE</span>
        </div>
        <button
          className="btn btn-icon settings-icon-btn"
          onClick={() => onNavigate('SETTINGS')}
          aria-label="Settings"
        >
          <SettingsIcon size={22} />
        </button>
      </header>

      {/* Stats Summary Card */}
      <div className="menu-stats-card">
        <div className="menu-stat-item">
          <span className="menu-stat-lbl">BEST SCORE</span>
          <span className="menu-stat-val">{globalBestScore.toLocaleString()}</span>
        </div>
        <div className="menu-stat-divider" />
        <div className="menu-stat-item">
          <span className="menu-stat-lbl">HIGHEST TILE</span>
          <span className="menu-stat-val">{globalHighestTile || 2}</span>
        </div>
      </div>

      {/* Board Grid Size Selector Bar */}
      <div className="grid-selector-card">
        <div className="grid-selector-header">
          <Grid3X3 size={18} className="grid-icon" />
          <span className="grid-selector-label">SELECT BOARD SIZE</span>
        </div>
        <div className="grid-pills-row">
          <button
            className={`grid-pill ${boardSize === 4 ? 'active' : ''}`}
            onClick={() => onSelectBoardSize(4)}
          >
            <span className="grid-pill-size">4×4</span>
            <span className="grid-pill-sub">Classic</span>
          </button>
          <button
            className={`grid-pill ${boardSize === 5 ? 'active' : ''}`}
            onClick={() => onSelectBoardSize(5)}
          >
            <span className="grid-pill-size">5×5</span>
            <span className="grid-pill-sub">Big</span>
          </button>
          <button
            className={`grid-pill ${boardSize === 6 ? 'active' : ''}`}
            onClick={() => onSelectBoardSize(6)}
          >
            <span className="grid-pill-size">6×6</span>
            <span className="grid-pill-sub">Mega</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: PRIMARY MODES */}
      <div className="menu-section">
        <span className="menu-section-title">PRIMARY MODES</span>
        <div className="mode-cards-container">
          <button className="mode-card classic-card" onClick={() => onSelectMode('CLASSIC')}>
            <div className="mode-card-icon">
              <Play size={24} />
            </div>
            <div className="mode-card-info">
              <h3 className="mode-card-title">CLASSIC</h3>
              <p className="mode-card-desc">Reach 2048</p>
            </div>
          </button>

          <button className="mode-card endless-card" onClick={() => onSelectMode('ENDLESS')}>
            <div className="mode-card-icon">
              <InfinityIcon size={24} />
            </div>
            <div className="mode-card-info">
              <h3 className="mode-card-title">ENDLESS</h3>
              <p className="mode-card-desc">Go beyond 2048</p>
            </div>
          </button>

          <button className="mode-card timeattack-card" onClick={() => onSelectMode('TIME_ATTACK')}>
            <div className="mode-card-icon">
              <Timer size={24} />
            </div>
            <div className="mode-card-info">
              <h3 className="mode-card-title">TIME ATTACK</h3>
              <p className="mode-card-desc">Score before time runs out</p>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 2: EXPANSION MODES */}
      <div className="menu-section">
        <span className="menu-section-title">EXPANSION MODES</span>
        <div className="mode-cards-container">
          <button className="mode-card moves-challenge-card" onClick={() => onSelectMode('MOVES_CHALLENGE')}>
            <div className="mode-card-icon">
              <Target size={24} />
            </div>
            <div className="mode-card-info">
              <h3 className="mode-card-title">MOVES CHALLENGE</h3>
              <p className="mode-card-desc">Reach target in limited moves</p>
            </div>
          </button>

          <button className="mode-card hardcore-card" onClick={() => onSelectMode('HARDCORE')}>
            <div className="mode-card-icon">
              <ShieldAlert size={24} />
            </div>
            <div className="mode-card-info">
              <h3 className="mode-card-title">HARDCORE</h3>
              <p className="mode-card-desc">Standard rules. No help.</p>
            </div>
          </button>

          <button className="mode-card mega-card" onClick={() => onSelectMode('MEGA_BOARD')}>
            <div className="mode-card-icon">
              <Grid3X3 size={24} />
            </div>
            <div className="mode-card-info">
              <h3 className="mode-card-title">MEGA BOARD</h3>
              <p className="mode-card-desc">More space. Bigger numbers.</p>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 3: SPECIAL MODES */}
      <div className="menu-section">
        <span className="menu-section-title">SPECIAL MODES</span>
        <div className="mode-cards-container">
          <button className="mode-card bomb-card" onClick={() => onSelectMode('BOMB')}>
            <div className="mode-card-icon">
              <Bomb size={24} />
            </div>
            <div className="mode-card-info">
              <h3 className="mode-card-title">BOMB MODE</h3>
              <p className="mode-card-desc">Clear crowded areas with strategic bombs</p>
            </div>
          </button>

          <button className="mode-card ice-card" onClick={() => onSelectMode('ICE')}>
            <div className="mode-card-icon">
              <Snowflake size={24} />
            </div>
            <div className="mode-card-info">
              <h3 className="mode-card-title">ICE MODE</h3>
              <p className="mode-card-desc">Break frozen tiles with smart merges</p>
            </div>
          </button>

          <button className="mode-card daily-card" onClick={() => onSelectMode('DAILY_CHALLENGE')}>
            <div className="mode-card-icon">
              <Calendar size={24} />
            </div>
            <div className="mode-card-info">
              <h3 className="mode-card-title">DAILY CHALLENGE</h3>
              <p className="mode-card-desc">A new puzzle every day. No internet required.</p>
            </div>
          </button>
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="secondary-menu-grid">
        <button className="secondary-btn" onClick={() => onNavigate('BEST_SCORES')}>
          <Trophy size={18} /> BEST SCORES
        </button>
        <button className="secondary-btn" onClick={() => onNavigate('STATISTICS')}>
          <BarChart3 size={18} /> STATISTICS
        </button>
        <button className="secondary-btn" onClick={() => onNavigate('HOW_TO_PLAY')}>
          <HelpCircle size={18} /> HOW TO PLAY
        </button>
        <button className="secondary-btn" onClick={() => onNavigate('ABOUT')}>
          <Info size={18} /> ABOUT
        </button>
      </div>
    </div>
  );
};

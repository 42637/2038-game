import React, { useState } from 'react';
import {
  Play,
  Infinity as InfinityIcon,
  Timer,
  Target,
  Trophy,
  BarChart3,
  HelpCircle,
  Settings as SettingsIcon,
  Info,
  Snowflake,
  Calendar,
  Palette,
  Volume2,
  VolumeX,
  Lightbulb,
  ChevronRight,
} from 'lucide-react';
import { ActiveScreen, BoardSize, GameMode, RecordsState, Theme } from '../../types/game';
import './MainMenu.css';

interface MainMenuProps {
  records: RecordsState;
  boardSize: BoardSize;
  theme?: Theme;
  soundEnabled?: boolean;
  onSelectBoardSize: (size: BoardSize) => void;
  onSelectTheme?: (theme: Theme) => void;
  onToggleSound?: () => void;
  onSelectMode: (mode: GameMode) => void;
  onNavigate: (screen: ActiveScreen) => void;
}

const THEME_CYCLE: Theme[] = ['CLASSIC', 'ICE', 'DARK', 'CYBER', 'SUNSET'];

const THEME_INFO: Record<Theme, { name: string; emoji: string }> = {
  CLASSIC: { name: 'Classic', emoji: '🌾' },
  ICE: { name: 'Ice Frost', emoji: '🧊' },
  DARK: { name: 'Dark Slate', emoji: '🌙' },
  CYBER: { name: 'Cyber Neon', emoji: '⚡' },
  SUNSET: { name: 'Sunset Gold', emoji: '🌅' },
};

export const MainMenu: React.FC<MainMenuProps> = ({
  boardSize,
  theme = 'CLASSIC',
  soundEnabled = true,
  onSelectTheme,
  onToggleSound,
  onSelectMode,
  onNavigate,
}) => {
  const [showThemePicker, setShowThemePicker] = useState(false);

  const handleCycleTheme = () => {
    if (!onSelectTheme) return;
    const currentIndex = THEME_CYCLE.indexOf(theme);
    const nextTheme = THEME_CYCLE[(currentIndex + 1) % THEME_CYCLE.length];
    onSelectTheme(nextTheme);
  };

  return (
    <div className="screen menu-screen">
      <div className="reference-menu-container">
        {/* 1. TOP BAR */}
        <header className="ref-header">
          <div className="ref-header-group left-group">
            <button
              className="ref-icon-btn"
              onClick={handleCycleTheme}
              onContextMenu={(e) => {
                e.preventDefault();
                setShowThemePicker(!showThemePicker);
              }}
              title={`Active Theme: ${THEME_INFO[theme]?.name} (Click to switch)`}
              aria-label="Switch Theme"
            >
              <Palette size={18} />
            </button>
            {onToggleSound && (
              <button
                className="ref-icon-btn"
                onClick={onToggleSound}
                title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
                aria-label="Toggle Sound"
              >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} className="muted-icon" />}
              </button>
            )}
          </div>

          <div className="ref-title-block">
            <h1 className="ref-app-title">
              MERGE <span className="title-number">2048</span>
            </h1>
            <div className="ref-offline-badge">
              <span className="ref-dot" /> OFFLINE
            </div>
          </div>

          <div className="ref-header-group right-group">
            <button
              className="ref-icon-btn"
              onClick={() => onNavigate('HOW_TO_PLAY')}
              title="How to Play"
              aria-label="How to Play"
            >
              <HelpCircle size={18} />
            </button>
            <button
              className="ref-icon-btn"
              onClick={() => onNavigate('SETTINGS')}
              title="Settings"
              aria-label="Settings"
            >
              <SettingsIcon size={18} />
            </button>
          </div>
        </header>

        {/* Theme Picker Modal */}
        {showThemePicker && (
          <div className="theme-popover-overlay" onClick={() => setShowThemePicker(false)}>
            <div className="theme-popover-card" onClick={(e) => e.stopPropagation()}>
              <span className="theme-popover-title">SELECT VISUAL THEME</span>
              <div className="theme-popover-grid">
                {THEME_CYCLE.map((th) => (
                  <button
                    key={th}
                    className={`theme-chip ${theme === th ? 'active' : ''}`}
                    onClick={() => {
                      onSelectTheme?.(th);
                      setShowThemePicker(false);
                    }}
                  >
                    <span>{THEME_INFO[th].emoji}</span>
                    <span>{THEME_INFO[th].name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. HERO ILLUSTRATION / TUTORIAL CARD */}
        <div className="ref-hero-card">
          <div className="ref-hero-content">
            <h2 className="ref-hero-headline">
              Merge numbers.<br />
              Reach <span className="headline-orange">2048!</span>
            </h2>
            <p className="ref-hero-desc">
              Slide matching tiles together<br />
              to create bigger numbers.
            </p>
            <div className="ref-hero-formula">
              <div className="mini-tile tile-val-2">2</div>
              <span className="formula-op">+</span>
              <div className="mini-tile tile-val-2">2</div>
              <span className="formula-arrow">➔</span>
              <div className="mini-tile tile-val-4">4</div>
            </div>
          </div>

          <div className="ref-hero-image-wrap">
            <img
              src="/board_hero.png"
              alt="2048 Board Preview"
              className="ref-hero-board-img"
            />
          </div>
        </div>

        {/* 3. PLAY CLASSIC BIG ACTION BANNER */}
        <button
          className="ref-play-classic-banner"
          onClick={() => onSelectMode('CLASSIC')}
          aria-label="Play Classic 2048"
        >
          <div className="play-icon-circle">
            <Play size={22} fill="currentColor" className="play-svg" />
          </div>
          <div className="play-classic-text">
            <span className="play-classic-title">PLAY CLASSIC</span>
            <span className="play-classic-sub">Start with the standard {boardSize}×{boardSize} board</span>
          </div>
          <ChevronRight size={22} className="play-chevron" />
        </button>

        {/* 4. HOW TO PLAY QUICK GUIDE CARD */}
        <button
          className="ref-how-to-play-card"
          onClick={() => onNavigate('HOW_TO_PLAY')}
          aria-label="Open How to Play Guide"
        >
          <div className="lightbulb-circle-wrap">
            <img src="/icon_how_to_play.png" alt="How to Play" className="how-to-play-logo-img" />
          </div>
          <div className="how-to-play-text">
            <span className="how-to-play-title">How to Play</span>
            <span className="how-to-play-sub">Quick guide for new players</span>
          </div>
          <ChevronRight size={22} className="guide-chevron" />
        </button>

        {/* 5. MORE WAYS TO PLAY SECTION (DIVIDER + 2x2 GRID + DAILY CHALLENGE) */}
        <div className="ref-more-ways-section">
          <div className="ref-section-divider">
            <span className="section-divider-title">MORE WAYS TO PLAY</span>
            <div className="section-divider-line" />
          </div>

          <div className="ref-secondary-modes">
            <div className="ref-modes-row">
              {/* Endless */}
              <button
                className="ref-mode-card mode-endless-bg"
                onClick={() => onSelectMode('ENDLESS')}
                aria-label="Endless Mode"
              >
                <img src="/icon_endless.png" alt="Endless" className="ref-mode-logo-img" />
                <div className="ref-mode-text-box">
                  <span className="ref-mode-title">Endless</span>
                  <span className="ref-mode-desc">Go beyond 2048</span>
                </div>
                <ChevronRight size={18} className="ref-mode-chevron" />
              </button>

              {/* Time Attack */}
              <button
                className="ref-mode-card mode-time-bg"
                onClick={() => onSelectMode('TIME_ATTACK')}
                aria-label="Time Attack Mode"
              >
                <img src="/icon_time.png" alt="Time Attack" className="ref-mode-logo-img" />
                <div className="ref-mode-text-box">
                  <span className="ref-mode-title">Time Attack</span>
                  <span className="ref-mode-desc">Score before time runs out</span>
                </div>
                <ChevronRight size={18} className="ref-mode-chevron" />
              </button>
            </div>

            <div className="ref-modes-row">
              {/* Moves Challenge */}
              <button
                className="ref-mode-card mode-moves-bg"
                onClick={() => onSelectMode('MOVES_CHALLENGE')}
                aria-label="Moves Challenge Mode"
              >
                <img src="/icon_moves.png" alt="Moves Challenge" className="ref-mode-logo-img" />
                <div className="ref-mode-text-box">
                  <span className="ref-mode-title">Moves Challenge</span>
                  <span className="ref-mode-desc">Reach target in limited moves</span>
                </div>
                <ChevronRight size={18} className="ref-mode-chevron" />
              </button>

              {/* Ice Mode */}
              <button
                className="ref-mode-card mode-ice-bg"
                onClick={() => onSelectMode('ICE')}
                aria-label="Ice Mode"
              >
                <img src="/icon_ice.png" alt="Ice Mode" className="ref-mode-logo-img" />
                <div className="ref-mode-text-box">
                  <span className="ref-mode-title">Ice Mode</span>
                  <span className="ref-mode-desc">Break frozen tiles with smart merges</span>
                </div>
                <ChevronRight size={18} className="ref-mode-chevron" />
              </button>
            </div>

            {/* Daily Challenge (Full-Width Banner) */}
            <button
              className="ref-mode-card mode-daily-full-bg"
              onClick={() => onSelectMode('DAILY_CHALLENGE')}
              aria-label="Daily Challenge"
            >
              <img src="/icon_daily.png" alt="Daily Challenge" className="ref-mode-logo-img" />
              <div className="ref-mode-text-box">
                <span className="ref-mode-title">Daily Challenge</span>
                <span className="ref-mode-desc">A new puzzle every day. No internet required.</span>
              </div>
              <ChevronRight size={20} className="ref-mode-chevron" />
            </button>
          </div>
        </div>

        {/* 7. BOTTOM NAVIGATION DOCK (4 Buttons with Dividers) */}
        <footer className="ref-dock-bar">
          <button
            className="ref-dock-btn"
            onClick={() => onNavigate('BEST_SCORES')}
            title="Best Scores"
          >
            <Trophy size={18} className="ref-dock-svg" />
            <span>SCORES</span>
          </button>
          <div className="ref-dock-divider" />
          <button
            className="ref-dock-btn"
            onClick={() => onNavigate('STATISTICS')}
            title="Statistics"
          >
            <BarChart3 size={18} className="ref-dock-svg" />
            <span>STATS</span>
          </button>
          <div className="ref-dock-divider" />
          <button
            className="ref-dock-btn"
            onClick={() => onNavigate('HOW_TO_PLAY')}
            title="How to Play"
          >
            <HelpCircle size={18} className="ref-dock-svg" />
            <span>RULES</span>
          </button>
          <div className="ref-dock-divider" />
          <button
            className="ref-dock-btn"
            onClick={() => onNavigate('ABOUT')}
            title="About Game"
          >
            <Info size={18} className="ref-dock-svg" />
            <span>ABOUT</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

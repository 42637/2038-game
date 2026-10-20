import React, { useState, useEffect } from 'react';
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
  X,
  Check,
  Grid3X3,
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

const THEME_HERO_BOARDS: Record<Theme, string> = {
  CLASSIC: '/board_hero_classic.png',
  ICE: '/board_hero_ice.png',
  DARK: '/board_hero_dark.png',
  CYBER: '/board_hero_cyber.png',
  SUNSET: '/board_hero_sunset.png',
};

const BOARD_SIZES: { size: BoardSize; name: string; tag: string; desc: string }[] = [
  { size: 4, name: 'Classic', tag: 'Standard', desc: '16 tiles • Fast & strategic gameplay' },
  { size: 5, name: 'Big', tag: 'Expanded', desc: '25 tiles • Extra room for high numbers' },
  { size: 6, name: 'Mega', tag: 'Massive', desc: '36 tiles • Giant sandbox for record runs' },
];

const MODE_DETAILS: Record<GameMode, { title: string; subtitle: string; icon: React.ReactNode; color: string }> = {
  CLASSIC: {
    title: 'CLASSIC 2048',
    subtitle: 'Merge matching numbers to reach 2048 and beyond',
    icon: <Play size={20} fill="currentColor" />,
    color: '#E83A69',
  },
  ENDLESS: {
    title: 'ENDLESS MODE',
    subtitle: 'No limits! Keep merging to reach 4096, 8192 & more',
    icon: <InfinityIcon size={20} />,
    color: '#8B5CF6',
  },
  TIME_ATTACK: {
    title: 'TIME ATTACK',
    subtitle: 'Race the clock! Score combos to earn bonus seconds',
    icon: <Timer size={20} />,
    color: '#F59E0B',
  },
  MOVES_CHALLENGE: {
    title: 'MOVES CHALLENGE',
    subtitle: 'Reach the objective before running out of swipes',
    icon: <Target size={20} />,
    color: '#F97316',
  },
  ICE: {
    title: 'ICE MODE',
    subtitle: 'Shatter frozen obstacles with adjacent merges',
    icon: <Snowflake size={20} />,
    color: '#0EA5E9',
  },
  DAILY_CHALLENGE: {
    title: 'DAILY CHALLENGE',
    subtitle: 'Deterministic offline daily puzzle. Keep your streak!',
    icon: <Calendar size={20} />,
    color: '#A855F7',
  },
};

export const MainMenu: React.FC<MainMenuProps> = ({
  boardSize,
  theme = 'CLASSIC',
  soundEnabled = true,
  onSelectBoardSize,
  onSelectTheme,
  onToggleSound,
  onSelectMode,
  onNavigate,
}) => {
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [selectedModeForSize, setSelectedModeForSize] = useState<GameMode | null>(null);
  const [tempBoardSize, setTempBoardSize] = useState<BoardSize>(boardSize);

  useEffect(() => {
    setTempBoardSize(boardSize);
  }, [boardSize]);

  const handleCycleTheme = () => {
    if (!onSelectTheme) return;
    const currentIndex = THEME_CYCLE.indexOf(theme);
    const nextTheme = THEME_CYCLE[(currentIndex + 1) % THEME_CYCLE.length];
    onSelectTheme(nextTheme);
  };

  const handleModeClick = (mode: GameMode) => {
    setTempBoardSize(boardSize);
    setSelectedModeForSize(mode);
  };

  const handleConfirmStart = () => {
    if (!selectedModeForSize) return;
    onSelectBoardSize(tempBoardSize);
    const mode = selectedModeForSize;
    setSelectedModeForSize(null);
    onSelectMode(mode);
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
        {theme === 'CYBER' ? (
          <div className="ref-hero-card cyber-custom-hero-banner">
            <img
              src="/cyber_hero_card_banner.png"
              alt="Merge numbers. Reach 2048!"
              className="cyber-banner-full-img"
              key="cyber-banner"
            />
          </div>
        ) : (
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
                src={THEME_HERO_BOARDS[theme] || '/board_hero_classic.png'}
                alt={`${THEME_INFO[theme]?.name || '2048'} Board Preview`}
                className="ref-hero-board-img"
                key={theme}
              />
            </div>
          </div>
        )}

        {/* 3. PLAY CLASSIC BIG ACTION BANNER */}
        <button
          className="ref-play-classic-banner"
          onClick={() => handleModeClick('CLASSIC')}
          aria-label="Play Classic 2048"
        >
          <div className="play-icon-circle">
            <Play size={22} fill="currentColor" className="play-svg" />
          </div>
          <div className="play-classic-text">
            <span className="play-classic-title">PLAY CLASSIC</span>
            <span className="play-classic-sub">
              Grid: <strong className="classic-size-highlight">{boardSize}×{boardSize}</strong> • Tap to choose size & play
            </span>
          </div>
          <ChevronRight size={22} className="play-chevron" />
        </button>

        {/* 4. HOW TO PLAY QUICK GUIDE CARD */}
        <button
          className="ref-how-to-play-card"
          onClick={() => onNavigate('HOW_TO_PLAY')}
          aria-label="Open How to Play Guide"
        >
          <div className="ref-how-to-play-badge">
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
                onClick={() => handleModeClick('ENDLESS')}
                aria-label="Endless Mode"
              >
                <div className="ref-mode-badge-wrap badge-endless">
                  <img src="/icon_endless.png" alt="Endless" className="ref-mode-logo-img" />
                </div>
                <div className="ref-mode-text-box">
                  <span className="ref-mode-title">Endless</span>
                  <span className="ref-mode-desc">Go beyond 2048</span>
                </div>
                <ChevronRight size={18} className="ref-mode-chevron" />
              </button>

              {/* Time Attack */}
              <button
                className="ref-mode-card mode-time-bg"
                onClick={() => handleModeClick('TIME_ATTACK')}
                aria-label="Time Attack Mode"
              >
                <div className="ref-mode-badge-wrap badge-time">
                  <img src="/icon_time.png" alt="Time Attack" className="ref-mode-logo-img" />
                </div>
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
                onClick={() => handleModeClick('MOVES_CHALLENGE')}
                aria-label="Moves Challenge Mode"
              >
                <div className="ref-mode-badge-wrap badge-moves">
                  <img src="/icon_moves.png" alt="Moves Challenge" className="ref-mode-logo-img" />
                </div>
                <div className="ref-mode-text-box">
                  <span className="ref-mode-title">Moves Challenge</span>
                  <span className="ref-mode-desc">Reach target in limited moves</span>
                </div>
                <ChevronRight size={18} className="ref-mode-chevron" />
              </button>

              {/* Ice Mode */}
              <button
                className="ref-mode-card mode-ice-bg"
                onClick={() => handleModeClick('ICE')}
                aria-label="Ice Mode"
              >
                <div className="ref-mode-badge-wrap badge-ice">
                  <img src="/icon_ice.png" alt="Ice Mode" className="ref-mode-logo-img" />
                </div>
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
              onClick={() => handleModeClick('DAILY_CHALLENGE')}
              aria-label="Daily Challenge"
            >
              <div className="ref-mode-badge-wrap badge-daily">
                <img src="/icon_daily.png" alt="Daily Challenge" className="ref-mode-logo-img" />
              </div>
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

      {/* 8. BOARD SIZE SELECTION MODAL */}
      {selectedModeForSize && (
        <div className="board-size-modal-overlay" onClick={() => setSelectedModeForSize(null)}>
          <div className="board-size-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="size-modal-header">
              <div
                className="size-modal-mode-badge"
                style={{
                  backgroundColor: `${MODE_DETAILS[selectedModeForSize].color}20`,
                  color: MODE_DETAILS[selectedModeForSize].color,
                }}
              >
                {MODE_DETAILS[selectedModeForSize].icon}
                <span className="size-modal-mode-name">{MODE_DETAILS[selectedModeForSize].title}</span>
              </div>
              <button
                className="size-modal-close-btn"
                onClick={() => setSelectedModeForSize(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Title & Desc */}
            <div className="size-modal-heading-block">
              <div className="size-modal-title-row">
                <Grid3X3 size={18} className="size-grid-icon" />
                <h3 className="size-modal-title">CHOOSE BOARD SIZE</h3>
              </div>
              <p className="size-modal-desc">
                {MODE_DETAILS[selectedModeForSize].subtitle}
              </p>
            </div>

            {/* Options */}
            <div className="size-options-list">
              {BOARD_SIZES.map((opt) => {
                const isSelected = tempBoardSize === opt.size;
                return (
                  <button
                    key={opt.size}
                    className={`size-option-card ${isSelected ? 'active' : ''}`}
                    onClick={() => setTempBoardSize(opt.size)}
                  >
                    <div className="size-option-left">
                      <div className={`size-mini-grid size-grid-${opt.size}`}>
                        {Array.from({ length: opt.size * opt.size }).map((_, i) => (
                          <span key={i} className="size-mini-cell" />
                        ))}
                      </div>
                      <div className="size-option-text">
                        <div className="size-option-title-row">
                          <span className="size-dimension">{opt.size} × {opt.size}</span>
                          <span className="size-badge-pill">{opt.name}</span>
                        </div>
                        <span className="size-option-desc">{opt.desc}</span>
                      </div>
                    </div>
                    <div className={`size-radio-circle ${isSelected ? 'checked' : ''}`}>
                      {isSelected && <Check size={14} className="size-check-icon" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Play CTA Button */}
            <button
              className="size-modal-play-btn"
              style={{
                background: `linear-gradient(135deg, ${MODE_DETAILS[selectedModeForSize].color} 0%, #D92662 100%)`,
              }}
              onClick={handleConfirmStart}
            >
              <Play size={20} fill="currentColor" />
              <span>START {MODE_DETAILS[selectedModeForSize].title.split(' ')[0]} ({tempBoardSize}×{tempBoardSize})</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

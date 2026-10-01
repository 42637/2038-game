import React, { useState } from 'react';
import { ArrowLeft, Volume2, Music, Smartphone, Sparkles, Trash2, HelpCircle, Info, Palette } from 'lucide-react';
import { ActiveScreen, SettingsState, Theme } from '../../types/game';
import './SettingsScreen.css';

interface SettingsScreenProps {
  settings: SettingsState;
  onUpdateSettings: (newSettings: SettingsState) => void;
  onResetProgress: () => void;
  onNavigate: (screen: ActiveScreen) => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onNavigate,
  onBack,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const toggleSetting = (key: keyof SettingsState) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleConfirmReset = () => {
    onResetProgress();
    setShowResetConfirm(false);
  };

  const themesList: { id: Theme; label: string; icon: string }[] = [
    { id: 'CLASSIC', label: 'Classic', icon: '🌾' },
    { id: 'ICE', label: 'Ice Frost', icon: '🧊' },
    { id: 'DARK', label: 'Dark', icon: '🌙' },
    { id: 'CYBER', label: 'Cyber Neon', icon: '⚡' },
    { id: 'SUNSET', label: 'Sunset Gold', icon: '🌅' },
  ];

  return (
    <div className="screen sub-screen">
      <header className="sub-header">
        <button className="btn btn-icon" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h2>SETTINGS</h2>
        <div style={{ width: 44 }} />
      </header>

      <div className="sub-content">
        <div className="settings-group">
          {/* Visual Theme Selector */}
          <div className="setting-row theme-setting-row">
            <div className="setting-label-block">
              <Palette className="setting-icon" size={20} />
              <span>App Visual Theme</span>
            </div>
            <div className="theme-selector-grid">
              {themesList.map((th) => (
                <button
                  key={th.id}
                  className={`theme-pill ${settings.theme === th.id ? 'active' : ''}`}
                  onClick={() => onUpdateSettings({ ...settings, theme: th.id })}
                >
                  <span className="theme-icon-emoji">{th.icon}</span>
                  <span>{th.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Board Size Selector */}
          <div className="setting-row">
            <div className="setting-label-block">
              <Sparkles className="setting-icon" size={20} />
              <span>Board Grid Size</span>
            </div>
            <div className="size-selector-pills">
              {[4, 5, 6].map((size) => (
                <button
                  key={`size_${size}`}
                  className={`size-pill ${settings.boardSize === size ? 'active' : ''}`}
                  onClick={() => onUpdateSettings({ ...settings, boardSize: size as 4 | 5 | 6 })}
                >
                  {size}×{size}
                </button>
              ))}
            </div>
          </div>

          {/* Sound Effects Toggle */}
          <div className="setting-row">
            <div className="setting-label-block">
              <Volume2 className="setting-icon" size={20} />
              <span>Sound Effects</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={() => toggleSetting('soundEnabled')}
              />
              <span className="slider" />
            </label>
          </div>

          {/* Music Toggle */}
          <div className="setting-row">
            <div className="setting-label-block">
              <Music className="setting-icon" size={20} />
              <span>Ambient Music</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.musicEnabled}
                onChange={() => toggleSetting('musicEnabled')}
              />
              <span className="slider" />
            </label>
          </div>

          {/* Vibration Toggle */}
          <div className="setting-row">
            <div className="setting-label-block">
              <Smartphone className="setting-icon" size={20} />
              <span>Vibration</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.vibrationEnabled}
                onChange={() => toggleSetting('vibrationEnabled')}
              />
              <span className="slider" />
            </label>
          </div>

          {/* Animations Toggle */}
          <div className="setting-row">
            <div className="setting-label-block">
              <Sparkles className="setting-icon" size={20} />
              <span>Animations</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.animationsEnabled}
                onChange={() => toggleSetting('animationsEnabled')}
              />
              <span className="slider" />
            </label>
          </div>
        </div>

        {/* Links */}
        <div className="settings-group">
          <button className="setting-link-btn" onClick={() => onNavigate('HOW_TO_PLAY')}>
            <div className="setting-label-block">
              <HelpCircle className="setting-icon" size={20} />
              <span>How to Play</span>
            </div>
            <span className="chevron">›</span>
          </button>

          <button className="setting-link-btn" onClick={() => onNavigate('ABOUT')}>
            <div className="setting-label-block">
              <Info className="setting-icon" size={20} />
              <span>About Merge 2048</span>
            </div>
            <span className="chevron">›</span>
          </button>
        </div>

        {/* Danger Zone: Reset Progress */}
        <div className="settings-group">
          <button className="btn btn-danger reset-btn" onClick={() => setShowResetConfirm(true)}>
            <Trash2 size={20} /> RESET ALL PROGRESS
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Reset Progress?</h2>
            <p className="modal-subtitle">
              This will permanently erase all best scores, statistics, and saved games.
            </p>
            <div className="modal-actions-row">
              <button className="btn btn-secondary flex-1" onClick={() => setShowResetConfirm(false)}>
                CANCEL
              </button>
              <button className="btn btn-danger flex-1" onClick={handleConfirmReset}>
                RESET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

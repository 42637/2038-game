import React from 'react';
import { Target, ShieldAlert, Grid3X3, Play, ArrowLeft, Bomb, Snowflake, Calendar } from 'lucide-react';
import { GameMode } from '../../types/game';
import './ModeIntroModal.css';

interface ModeIntroModalProps {
  mode: GameMode;
  onStart: () => void;
  onCancel: () => void;
}

export const ModeIntroModal: React.FC<ModeIntroModalProps> = ({ mode, onStart, onCancel }) => {
  const getIntroDetails = () => {
    switch (mode) {
      case 'MOVES_CHALLENGE':
        return {
          icon: <Target size={36} className="intro-icon challenge-icon" />,
          title: 'MOVES CHALLENGE',
          subtitle: 'Reach the target before you run out of moves.',
          bullets: [
            'Each valid move consumes 1 attempt',
            'Invalid swipes do NOT waste moves',
            'Progress through 7 increasing difficulty levels',
          ],
          startText: 'START CHALLENGE',
        };
      case 'HARDCORE':
        return {
          icon: <ShieldAlert size={36} className="intro-icon hardcore-icon" />,
          title: 'HARDCORE MODE',
          subtitle: 'Play with the original rules and no second chances.',
          bullets: [
            'No Undo support',
            'No Power-ups or recovery tools',
            'One mistake can end your run. Pure skill.',
          ],
          startText: 'START HARDCORE',
        };
      case 'MEGA_BOARD':
        return {
          icon: <Grid3X3 size={36} className="intro-icon mega-icon" />,
          title: 'MEGA BOARD (5×5)',
          subtitle: 'More space. More possibilities. Reach higher tiles.',
          bullets: [
            'Expanded 5 columns × 5 rows grid',
            'Higher tile combinations beyond 2048',
            'Same classic swipe mechanics',
          ],
          startText: 'PLAY MEGA BOARD',
        };
      case 'BOMB':
        return {
          icon: <Bomb size={36} className="intro-icon bomb-icon" />,
          title: 'BOMB MODE',
          subtitle: 'DEFUSE bombs before the 2-move fuse expires!',
          bullets: [
            'Bombs spawn with a 2-move countdown fuse',
            'Merge adjacent tiles to DEFUSE the bomb for a +300 PTS bonus',
            'If the 2-move fuse reaches 0 without defusal, the bomb EXPLODES (-200 PTS penalty)!',
          ],
          startText: 'START BOMB MODE',
        };
      case 'ICE':
        return {
          icon: <Snowflake size={36} className="intro-icon ice-icon" />,
          title: 'ICE MODE',
          subtitle: 'Unfreeze tiles to keep the board moving.',
          bullets: [
            'Frozen tiles cannot shift or merge',
            'Perform 3 adjacent merges to break the ice (1/3 → 2/3 → 3/3)',
            'Once ice shatters, the tile becomes normal',
          ],
          startText: 'START ICE MODE',
        };
      case 'DAILY_CHALLENGE':
        return {
          icon: <Calendar size={36} className="intro-icon daily-icon" />,
          title: 'DAILY CHALLENGE',
          subtitle: 'A new deterministic puzzle every single day.',
          bullets: [
            '100% offline — no internet connection required',
            'Generated deterministically from today\'s date',
            'Win to build your daily streak 🔥 and earn records',
          ],
          startText: 'OPEN DAILY CHALLENGE',
        };
      default:
        return null;
    }
  };

  const details = getIntroDetails();
  if (!details) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content mode-intro-card">
        <div className="intro-icon-wrapper">{details.icon}</div>

        <h2 className="modal-title">{details.title}</h2>
        <p className="modal-subtitle">{details.subtitle}</p>

        <div className="intro-bullets">
          {details.bullets.map((b, idx) => (
            <div key={`bullet_${idx}`} className="bullet-row">
              <span className="bullet-dot">•</span>
              <span className="bullet-text">{b}</span>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onStart}>
            <Play size={20} /> {details.startText}
          </button>
          <button className="btn btn-secondary" onClick={onCancel}>
            <ArrowLeft size={18} /> BACK
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { RotateCcw, Hammer, Shuffle, Gamepad2 } from 'lucide-react';
import './ActionBar.css';

interface ActionBarProps {
  canUndo: boolean;
  undoCount: number;
  onUndo: () => void;
  hammerCount: number;
  isHammerActive: boolean;
  onToggleHammer: () => void;
  shuffleCount: number;
  onShuffle: () => void;
  showDPad: boolean;
  onToggleDPad: () => void;
  disabled?: boolean;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  canUndo,
  undoCount,
  onUndo,
  hammerCount,
  isHammerActive,
  onToggleHammer,
  shuffleCount,
  onShuffle,
  showDPad,
  onToggleDPad,
  disabled = false,
}) => {
  return (
    <div className={`action-bar-container ${disabled ? 'action-bar-disabled' : ''}`}>
      <button
        className={`action-btn ${canUndo ? '' : 'action-btn-disabled'}`}
        onClick={onUndo}
        disabled={!canUndo || disabled}
        title="Undo last move"
      >
        <RotateCcw size={18} />
        <span>UNDO</span>
        <span className="action-badge">{undoCount}</span>
      </button>

      <button
        className={`action-btn ${isHammerActive ? 'action-btn-active' : ''} ${hammerCount <= 0 ? 'action-btn-disabled' : ''
          }`}
        onClick={onToggleHammer}
        disabled={hammerCount <= 0 || disabled}
        title="Hammer: Destroy 1 tile"
      >
        <Hammer size={18} />
        <span>HAMMER</span>
        <span className="action-badge">{hammerCount}</span>
      </button>

      <button
        className={`action-btn ${shuffleCount <= 0 ? 'action-btn-disabled' : ''}`}
        onClick={onShuffle}
        disabled={shuffleCount <= 0 || disabled}
        title="Shuffle: Rearrange tiles"
      >
        <Shuffle size={18} />
        <span>SHUFFLE</span>
        <span className="action-badge">{shuffleCount}</span>
      </button>

      <button
        className={`action-btn ${showDPad ? 'action-btn-active' : ''}`}
        onClick={onToggleDPad}
        title="Toggle Touch Controls D-Pad"
      >
        <Gamepad2 size={18} />
        <span>D-PAD</span>
      </button>
    </div>
  );
};

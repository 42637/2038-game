import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Direction } from '../../types/game';
import './DPadControls.css';

interface DPadControlsProps {
  onSwipe: (direction: Direction) => void;
  disabled?: boolean;
}

export const DPadControls: React.FC<DPadControlsProps> = ({ onSwipe, disabled = false }) => {
  return (
    <div className={`dpad-container ${disabled ? 'dpad-disabled' : ''}`}>
      <div className="dpad-grid">
        <button
          className="dpad-btn dpad-up"
          onClick={() => !disabled && onSwipe('UP')}
          aria-label="Move Up"
        >
          <ArrowUp size={22} />
        </button>
        <button
          className="dpad-btn dpad-left"
          onClick={() => !disabled && onSwipe('LEFT')}
          aria-label="Move Left"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="dpad-center" />
        <button
          className="dpad-btn dpad-right"
          onClick={() => !disabled && onSwipe('RIGHT')}
          aria-label="Move Right"
        >
          <ArrowRight size={22} />
        </button>
        <button
          className="dpad-btn dpad-down"
          onClick={() => !disabled && onSwipe('DOWN')}
          aria-label="Move Down"
        >
          <ArrowDown size={22} />
        </button>
      </div>
    </div>
  );
};

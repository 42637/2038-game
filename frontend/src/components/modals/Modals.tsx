import React from 'react';
import { Play, RotateCcw, Home, Trophy, Sparkles, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import './Modals.css';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onResume, onRestart, onMainMenu }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">GAME PAUSED</h2>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onResume}>
            <Play size={20} /> RESUME
          </button>
          <button className="btn btn-secondary" onClick={onRestart}>
            <RotateCcw size={20} /> RESTART
          </button>
          <button className="btn btn-secondary" onClick={onMainMenu}>
            <Home size={20} /> MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};

interface RestartConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const RestartConfirmModal: React.FC<RestartConfirmModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-icon-wrapper warning-icon">
          <AlertTriangle size={32} />
        </div>
        <h2 className="modal-title">Restart this game?</h2>
        <p className="modal-subtitle">Your current progress will be lost.</p>

        <div className="modal-actions-row">
          <button className="btn btn-secondary flex-1" onClick={onCancel}>
            CANCEL
          </button>
          <button className="btn btn-danger flex-1" onClick={onConfirm}>
            RESTART
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  score: number;
  bestScore: number;
  highestTile: number;
  moves: number;
  isNewBest: boolean;
  onTryAgain: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  bestScore,
  highestTile,
  moves,
  isNewBest,
  onTryAgain,
  onMainMenu,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content game-over-modal">
        {isNewBest ? (
          <div className="new-best-badge">
            <Sparkles size={20} /> NEW BEST!
          </div>
        ) : (
          <h2 className="modal-title">GAME OVER</h2>
        )}

        <div className="result-score-block">
          <span className="result-score-label">FINAL SCORE</span>
          <span className="result-score-value">{score.toLocaleString()}</span>
        </div>

        <div className="result-stats-grid">
          <div className="result-stat-item">
            <span className="result-stat-label">HIGHEST TILE</span>
            <span className="result-stat-val">{highestTile}</span>
          </div>

          <div className="result-stat-item">
            <span className="result-stat-label">TOTAL MOVES</span>
            <span className="result-stat-val">{moves}</span>
          </div>

          <div className="result-stat-item">
            <span className="result-stat-label">{isNewBest ? 'PREVIOUS BEST' : 'BEST SCORE'}</span>
            <span className="result-stat-val">{bestScore.toLocaleString()}</span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onTryAgain}>
            <RotateCcw size={20} /> TRY AGAIN
          </button>
          <button className="btn btn-secondary" onClick={onMainMenu}>
            <Home size={20} /> MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};

interface ChallengeCompleteModalProps {
  targetTile: number;
  movesUsed: number;
  moveLimit: number;
  score: number;
  highestTile: number;
  hasNextChallenge: boolean;
  onNextChallenge?: () => void;
  onRetry: () => void;
  onMainMenu: () => void;
}

export const ChallengeCompleteModal: React.FC<ChallengeCompleteModalProps> = ({
  targetTile,
  movesUsed,
  moveLimit,
  score,
  highestTile,
  hasNextChallenge,
  onNextChallenge,
  onRetry,
  onMainMenu,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-icon-wrapper success-icon">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="modal-title">CHALLENGE COMPLETE!</h2>

        <div className="result-score-block">
          <span className="result-score-label">SCORE</span>
          <span className="result-score-value">{score.toLocaleString()}</span>
        </div>

        <div className="result-stats-grid">
          <div className="result-stat-item">
            <span className="result-stat-label">TARGET</span>
            <span className="result-stat-val text-accent-target">{targetTile}</span>
          </div>

          <div className="result-stat-item">
            <span className="result-stat-label">MOVES USED</span>
            <span className="result-stat-val">
              {movesUsed}/{moveLimit}
            </span>
          </div>

          <div className="result-stat-item">
            <span className="result-stat-label">HIGHEST TILE</span>
            <span className="result-stat-val">{highestTile}</span>
          </div>
        </div>

        <div className="modal-actions">
          {hasNextChallenge && onNextChallenge && (
            <button className="btn btn-primary" onClick={onNextChallenge}>
              <Play size={20} /> NEXT CHALLENGE
            </button>
          )}
          <button className="btn btn-secondary" onClick={onRetry}>
            <RotateCcw size={20} /> RETRY
          </button>
          <button className="btn btn-secondary" onClick={onMainMenu}>
            <Home size={20} /> MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};

interface ChallengeFailedModalProps {
  targetTile: number;
  movesUsed: number;
  moveLimit: number;
  highestTile: number;
  onRetry: () => void;
  onMainMenu: () => void;
}

export const ChallengeFailedModal: React.FC<ChallengeFailedModalProps> = ({
  targetTile,
  movesUsed,
  moveLimit,
  highestTile,
  onRetry,
  onMainMenu,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-icon-wrapper danger-icon">
          <XCircle size={36} />
        </div>
        <h2 className="modal-title">CHALLENGE FAILED</h2>
        <p className="modal-subtitle">Ran out of moves before reaching {targetTile}</p>

        <div className="result-stats-grid">
          <div className="result-stat-item">
            <span className="result-stat-label">TARGET</span>
            <span className="result-stat-val">{targetTile}</span>
          </div>

          <div className="result-stat-item">
            <span className="result-stat-label">MOVES USED</span>
            <span className="result-stat-val">
              {movesUsed}/{moveLimit}
            </span>
          </div>

          <div className="result-stat-item">
            <span className="result-stat-label">BEST TILE REACHED</span>
            <span className="result-stat-val">{highestTile}</span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onRetry}>
            <RotateCcw size={20} /> RETRY
          </button>
          <button className="btn btn-secondary" onClick={onMainMenu}>
            <Home size={20} /> MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};

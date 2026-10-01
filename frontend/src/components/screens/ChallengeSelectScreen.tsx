import React from 'react';
import { ArrowLeft, Target, Lock, CheckCircle2, Trophy, Footprints } from 'lucide-react';
import { ChallengeLevel, MovesChallengeRecordsState } from '../../types/game';
import { CHALLENGE_LEVELS } from '../../game/modeManager';
import './ChallengeSelectScreen.css';

interface ChallengeSelectScreenProps {
  records: MovesChallengeRecordsState;
  onSelectChallenge: (level: ChallengeLevel) => void;
  onBack: () => void;
}

export const ChallengeSelectScreen: React.FC<ChallengeSelectScreenProps> = ({
  records,
  onSelectChallenge,
  onBack,
}) => {
  return (
    <div className="screen sub-screen">
      <header className="sub-header">
        <button className="btn btn-icon" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h2>MOVES CHALLENGES</h2>
        <div style={{ width: 44 }} />
      </header>

      <div className="sub-content">
        <p className="sub-desc">Reach target tiles within limited move counts.</p>

        <div className="challenges-list">
          {CHALLENGE_LEVELS.map((level) => {
            const isUnlocked = level.levelNumber <= records.highestUnlockedLevel;
            const isCompleted = records.completedLevels.includes(level.levelNumber);
            const bestMoves = records.bestMovesPerLevel[level.levelNumber];

            return (
              <button
                key={level.id}
                className={`challenge-level-item ${isUnlocked ? 'unlocked' : 'locked'} ${
                  isCompleted ? 'completed' : ''
                }`}
                onClick={() => isUnlocked && onSelectChallenge(level)}
                disabled={!isUnlocked}
              >
                <div className="challenge-level-left">
                  <div className="level-number-badge">
                    {isCompleted ? (
                      <CheckCircle2 size={20} className="completed-icon" />
                    ) : isUnlocked ? (
                      <span>L{level.levelNumber}</span>
                    ) : (
                      <Lock size={18} className="lock-icon" />
                    )}
                  </div>

                  <div className="challenge-info">
                    <h4 className="challenge-title">{level.title}</h4>
                    <span className="challenge-target-text">
                      Reach <strong className="target-num">{level.targetTile}</strong> in{' '}
                      <strong>{level.moveLimit}</strong> moves
                    </span>
                  </div>
                </div>

                <div className="challenge-level-right">
                  {isCompleted && bestMoves !== undefined && (
                    <div className="best-moves-tag">
                      <Footprints size={14} />
                      <span>{bestMoves} moves</span>
                    </div>
                  )}
                  {isUnlocked && <span className="play-arrow">›</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

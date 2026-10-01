import React from 'react';
import { ArrowLeft, Flame, Play, CheckCircle2, Trophy, RotateCcw, Calendar } from 'lucide-react';
import { DailyChallengeConfig, RecordsState } from '../../types/game';
import { formatReadableDate, getTodayDateSeed } from '../../game/dailyChallengeGenerator';
import './DailyChallengeScreen.css';

interface DailyChallengeScreenProps {
  challenge: DailyChallengeConfig;
  records: RecordsState;
  onStartChallenge: () => void;
  onBack: () => void;
}

export const DailyChallengeScreen: React.FC<DailyChallengeScreenProps> = ({
  challenge,
  records,
  onStartChallenge,
  onBack,
}) => {
  const todaySeed = getTodayDateSeed();
  const todayHistory = records.daily.history[todaySeed];
  const isCompletedToday = todayHistory?.completed || false;
  const streak = records.daily.streak || { currentStreak: 0, bestStreak: 0 };

  // Generate previous 7 days seeds for calendar history
  const getPastSevenDays = () => {
    const list: { seed: string; label: string; record?: { completed: boolean } }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const seed = `${year}-${month}-${day}`;
      const label = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      list.push({
        seed,
        label,
        record: records.daily.history[seed],
      });
    }
    return list;
  };

  const pastSevenDays = getPastSevenDays();

  return (
    <div className="screen sub-screen daily-screen">
      <header className="sub-header">
        <button className="btn btn-icon" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h2>DAILY CHALLENGE</h2>
        <div style={{ width: 44 }} />
      </header>

      <div className="sub-content">
        {/* Date & Title Banner */}
        <div className="daily-banner-card">
          <div className="daily-date-badge">
            <Calendar size={14} />
            <span>{formatReadableDate(challenge.dateSeed).toUpperCase()}</span>
          </div>
          <h3 className="daily-challenge-title">{challenge.title}</h3>
          <p className="daily-challenge-desc">{challenge.description}</p>
        </div>

        {/* Streak Stats Card */}
        <div className="streak-stats-card">
          <div className="streak-stat-item">
            <div className="streak-icon-wrap">
              <Flame size={22} className="flame-icon current" />
            </div>
            <div className="streak-text-group">
              <span className="streak-val">{streak.currentStreak} DAYS</span>
              <span className="streak-lbl">CURRENT STREAK</span>
            </div>
          </div>
          <div className="streak-divider" />
          <div className="streak-stat-item">
            <div className="streak-icon-wrap">
              <Trophy size={20} className="trophy-icon" />
            </div>
            <div className="streak-text-group">
              <span className="streak-val">{streak.bestStreak} DAYS</span>
              <span className="streak-lbl">BEST STREAK</span>
            </div>
          </div>
        </div>

        {/* 7-Day History Calendar Row */}
        <div className="daily-history-section">
          <span className="section-subtitle">RECENT DAYS</span>
          <div className="history-pills-row">
            {pastSevenDays.map((item) => {
              const isToday = item.seed === todaySeed;
              const isDone = item.record?.completed;
              return (
                <div
                  key={item.seed}
                  className={`history-pill ${isToday ? 'is-today' : ''} ${
                    isDone ? 'is-completed' : item.record ? 'is-attempted' : ''
                  }`}
                >
                  <span className="history-pill-day">{item.label}</span>
                  {isDone ? (
                    <CheckCircle2 size={16} className="pill-icon done" />
                  ) : isToday ? (
                    <span className="pill-icon today-dot">•</span>
                  ) : (
                    <span className="pill-icon empty-dash">-</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Status & Action */}
        <div className="daily-action-card">
          {isCompletedToday ? (
            <div className="completed-badge-box">
              <CheckCircle2 size={32} className="completed-big-icon" />
              <h4>TODAY'S CHALLENGE COMPLETED!</h4>
              <p>Score: {todayHistory.score.toLocaleString()} pts • Moves: {todayHistory.moves}</p>
            </div>
          ) : (
            <div className="objective-detail-box">
              <span className="obj-lbl">TARGET</span>
              <span className="obj-val">
                {challenge.targetTile ? `${challenge.targetTile} Tile` : `${challenge.targetScore} Pts`}
              </span>
              <span className="obj-sub">Limit: {challenge.moveLimit} moves</span>
            </div>
          )}

          <button className="btn btn-primary btn-block play-daily-btn" onClick={onStartChallenge}>
            {isCompletedToday ? (
              <>
                <RotateCcw size={20} /> REPLAY CHALLENGE
              </>
            ) : (
              <>
                <Play size={20} /> PLAY TODAY'S CHALLENGE
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

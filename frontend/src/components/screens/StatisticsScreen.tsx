import React from 'react';
import { ArrowLeft, Trophy, Flame, Layers, Hash } from 'lucide-react';
import { RecordsState, StatisticsState } from '../../types/game';
import './StatisticsScreen.css';

interface StatisticsScreenProps {
  stats: StatisticsState;
  records: RecordsState;
  onBack: () => void;
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ stats, records, onBack }) => {
  return (
    <div className="screen sub-screen">
      <header className="sub-header">
        <button className="btn btn-icon" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h2>STATISTICS</h2>
        <div style={{ width: 44 }} />
      </header>

      <div className="sub-content">
        {/* Overview Stats Grid */}
        <div className="stats-overview-grid">
          <div className="overview-card">
            <Hash className="overview-icon" size={20} />
            <span className="overview-val">{stats.gamesPlayed}</span>
            <span className="overview-lbl">GAMES PLAYED</span>
          </div>

          <div className="overview-card">
            <Trophy className="overview-icon" size={20} />
            <span className="overview-val">{stats.totalScore.toLocaleString()}</span>
            <span className="overview-lbl">TOTAL SCORE</span>
          </div>

          <div className="overview-card">
            <Flame className="overview-icon" size={20} />
            <span className="overview-val">{stats.highestTile || 2}</span>
            <span className="overview-lbl">HIGHEST TILE</span>
          </div>

          <div className="overview-card">
            <Layers className="overview-icon" size={20} />
            <span className="overview-val">{stats.totalMerges.toLocaleString()}</span>
            <span className="overview-lbl">TOTAL MERGES</span>
          </div>
        </div>

        {/* Primary Modes Breakdown */}
        <h3 className="section-title">Primary Modes</h3>
        <div className="mode-breakdown-card">
          <div className="breakdown-row">
            <span className="breakdown-name">Classic Games</span>
            <span className="breakdown-val">{stats.classicGames || 0}</span>
          </div>
          <div className="breakdown-row">
            <span className="breakdown-name">Endless Games</span>
            <span className="breakdown-val">{stats.endlessGames || 0}</span>
          </div>
          <div className="breakdown-row">
            <span className="breakdown-name">Time Attack Games</span>
            <span className="breakdown-val">{stats.timeAttackGames || 0}</span>
          </div>
        </div>

        {/* Expansion Modes Breakdown */}
        <h3 className="section-title">Expansion Modes</h3>
        <div className="mode-breakdown-card">
          <div className="breakdown-row">
            <span className="breakdown-name">Moves Challenge Cleared</span>
            <span className="breakdown-val">
              {stats.movesChallengeCompleted || 0} / 7
            </span>
          </div>
          <div className="breakdown-row">
            <span className="breakdown-name">Hardcore Games</span>
            <span className="breakdown-val">{stats.hardcoreGames || 0}</span>
          </div>
          <div className="breakdown-row">
            <span className="breakdown-name">Mega Board Games (5×5)</span>
            <span className="breakdown-val">{stats.megaBoardGames || 0}</span>
          </div>
        </div>

        {/* Phase 3 Special Modes Breakdown */}
        <h3 className="section-title">Special Modes & Daily</h3>
        <div className="mode-breakdown-card">
          <div className="breakdown-row">
            <span className="breakdown-name">Bomb Games / Detonated</span>
            <span className="breakdown-val">
              {stats.bombGames || 0} ({stats.bombsTriggered || 0}💣)
            </span>
          </div>
          <div className="breakdown-row">
            <span className="breakdown-name">Ice Games / Unfrozen</span>
            <span className="breakdown-val">
              {stats.iceGames || 0} ({stats.iceCleared || 0}🧊)
            </span>
          </div>
          <div className="breakdown-row">
            <span className="breakdown-name">Daily Challenges Completed</span>
            <span className="breakdown-val">{stats.dailyCompleted || 0}</span>
          </div>
          <div className="breakdown-row">
            <span className="breakdown-name">Current / Best Streak</span>
            <span className="breakdown-val">
              {stats.currentDailyStreak || 0}d / {stats.bestDailyStreak || 0}d 🔥
            </span>
          </div>
        </div>

        {/* High Scores Summary */}
        <h3 className="section-title">Best Mode Scores</h3>
        <div className="mode-breakdown-card">
          <div className="breakdown-row">
            <span className="breakdown-name">Best Classic</span>
            <span className="breakdown-val">{records.classicBest.toLocaleString()}</span>
          </div>
          <div className="breakdown-row">
            <span className="breakdown-name">Best Endless</span>
            <span className="breakdown-val">{records.endlessBest.toLocaleString()}</span>
          </div>
          <div className="breakdown-row">
            <span className="breakdown-name">Best Time Attack</span>
            <span className="breakdown-val">{records.timeAttackBest.toLocaleString()}</span>
          </div>
          <div className="breakdown-row">
            <span className="breakdown-name">Best Hardcore</span>
            <span className="breakdown-val">
              {(records.hardcore?.bestScore || 0).toLocaleString()}
            </span>
          </div>
          <div className="breakdown-row">
            <span className="breakdown-name">Best Mega Board</span>
            <span className="breakdown-val">
              {(records.megaBoard?.bestScore || 0).toLocaleString()}
            </span>
          </div>
          <div className="breakdown-row">
            <span className="breakdown-name">Best Bomb Mode</span>
            <span className="breakdown-val">
              {(records.bomb?.bestScore || 0).toLocaleString()}
            </span>
          </div>
          <div className="breakdown-row">
            <span className="breakdown-name">Best Ice Mode</span>
            <span className="breakdown-val">
              {(records.ice?.bestScore || 0).toLocaleString()}
            </span>
          </div>
          <div className="breakdown-row">
            <span className="breakdown-name">Best Daily Challenge</span>
            <span className="breakdown-val">
              {(records.daily?.bestScore || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

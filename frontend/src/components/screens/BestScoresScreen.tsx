import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Infinity as InfinityIcon,
  Timer,
  Target,
  ShieldAlert,
  Grid3X3,
  Globe,
  UserCheck,
  Bomb,
  Snowflake,
  Calendar,
  Flame,
} from 'lucide-react';
import { GameMode, RecordsState } from '../../types/game';
import { apiService, LeaderboardEntry } from '../../services/api';
import './BestScoresScreen.css';

interface BestScoresScreenProps {
  records: RecordsState;
  onBack: () => void;
}

export const BestScoresScreen: React.FC<BestScoresScreenProps> = ({ records, onBack }) => {
  const [tab, setTab] = useState<'LOCAL' | 'ONLINE'>('LOCAL');
  const [selectedOnlineMode, setSelectedOnlineMode] = useState<GameMode>('CLASSIC');
  const [onlineEntries, setOnlineEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === 'ONLINE') {
      setLoading(true);
      apiService.getLeaderboard(selectedOnlineMode).then((entries) => {
        setOnlineEntries(entries);
        setLoading(false);
      });
    }
  }, [tab, selectedOnlineMode]);

  return (
    <div className="screen sub-screen">
      <header className="sub-header">
        <button className="btn btn-icon" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h2>BEST SCORES</h2>
        <div style={{ width: 44 }} />
      </header>

      <div className="sub-content">
        {/* Tab Switcher */}
        <div className="scores-tab-bar">
          <button
            className={`scores-tab-btn ${tab === 'LOCAL' ? 'active' : ''}`}
            onClick={() => setTab('LOCAL')}
          >
            <UserCheck size={16} /> LOCAL RECORDS
          </button>
          <button
            className={`scores-tab-btn ${tab === 'ONLINE' ? 'active' : ''}`}
            onClick={() => setTab('ONLINE')}
          >
            <Globe size={16} /> ONLINE LEADERBOARD
          </button>
        </div>

        {tab === 'LOCAL' ? (
          <>
            <p className="sub-desc">Your personal offline record leaderboards across all modes.</p>

            <div className="records-list">
              {/* Classic Mode */}
              <div className="record-card">
                <div className="record-card-header">
                  <div className="record-icon classic-bg">
                    <Play size={20} />
                  </div>
                  <span className="record-mode-title">CLASSIC MODE</span>
                </div>
                <div className="record-stats-row">
                  <div className="record-stat-box">
                    <span className="record-stat-lbl">BEST SCORE</span>
                    <span className="record-stat-num">{records.classicBest.toLocaleString()}</span>
                  </div>
                  <div className="record-stat-box">
                    <span className="record-stat-lbl">HIGHEST TILE</span>
                    <span className="record-stat-num">{records.classicHighestTile || 2}</span>
                  </div>
                </div>
              </div>

              {/* Endless Mode */}
              <div className="record-card">
                <div className="record-card-header">
                  <div className="record-icon endless-bg">
                    <InfinityIcon size={20} />
                  </div>
                  <span className="record-mode-title">ENDLESS MODE</span>
                </div>
                <div className="record-stats-row">
                  <div className="record-stat-box">
                    <span className="record-stat-lbl">BEST SCORE</span>
                    <span className="record-stat-num">{records.endlessBest.toLocaleString()}</span>
                  </div>
                  <div className="record-stat-box">
                    <span className="record-stat-lbl">HIGHEST TILE</span>
                    <span className="record-stat-num">{records.endlessHighestTile || 2}</span>
                  </div>
                </div>
              </div>

              {/* Time Attack */}
              <div className="record-card">
                <div className="record-card-header">
                  <div className="record-icon timeattack-bg">
                    <Timer size={20} />
                  </div>
                  <span className="record-mode-title">TIME ATTACK</span>
                </div>
                <div className="record-stats-row">
                  <div className="record-stat-box">
                    <span className="record-stat-lbl">BEST SCORE</span>
                    <span className="record-stat-num">{records.timeAttackBest.toLocaleString()}</span>
                  </div>
                  <div className="record-stat-box">
                    <span className="record-stat-lbl">HIGHEST TILE</span>
                    <span className="record-stat-num">{records.timeAttackHighestTile || 2}</span>
                  </div>
                </div>
              </div>

              {/* Moves Challenge */}
              <div className="record-card">
                <div className="record-card-header">
                  <div className="record-icon challenge-bg">
                    <Target size={20} />
                  </div>
                  <span className="record-mode-title">MOVES CHALLENGE</span>
                </div>
                <div className="record-stats-row">
                  <div className="record-stat-box">
                    <span className="record-stat-lbl">LEVELS CLEARED</span>
                    <span className="record-stat-num">
                      {records.movesChallenge?.completedLevels?.length || 0}/7
                    </span>
                  </div>
                  <div className="record-stat-box">
                    <span className="record-stat-lbl">HIGHEST UNLOCKED</span>
                    <span className="record-stat-num">
                      L{records.movesChallenge?.highestUnlockedLevel || 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hardcore Mode */}
              <div className="record-card">
                <div className="record-card-header">
                  <div className="record-icon hardcore-bg">
                    <ShieldAlert size={20} />
                  </div>
                  <span className="record-mode-title">HARDCORE MODE</span>
                </div>
                <div className="record-stats-row">
                  <div className="record-stat-box">
                    <span className="record-stat-lbl">BEST SCORE</span>
                    <span className="record-stat-num">
                      {(records.hardcore?.bestScore || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="record-stat-box">
                    <span className="record-stat-lbl">HIGHEST TILE</span>
                    <span className="record-stat-num">{records.hardcore?.highestTile || 2}</span>
                  </div>
                </div>
              </div>

              {/* Mega Board Mode */}
              <div className="record-card">
                <div className="record-card-header">
                  <div className="record-icon mega-bg">
                    <Grid3X3 size={20} />
                  </div>
                  <span className="record-mode-title">MEGA BOARD</span>
                </div>
                <div className="record-stats-row">
                  <div className="record-stat-box">
                    <span className="record-stat-lbl">BEST SCORE</span>
                    <span className="record-stat-num">
                      {(records.megaBoard?.bestScore || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="record-stat-box">
                    <span className="record-stat-lbl">HIGHEST TILE</span>
                    <span className="record-stat-num">{records.megaBoard?.highestTile || 2}</span>
                  </div>
                </div>
              </div>

              {/* Bomb Mode */}
              <div className="record-card">
                <div className="record-card-header">
                  <div className="record-icon bomb-bg">
                    <Bomb size={20} />
                  </div>
                  <span className="record-mode-title">BOMB MODE</span>
                </div>
                <div className="record-stats-row">
                  <div className="record-stat-box">
                    <span className="record-stat-lbl">BEST SCORE</span>
                    <span className="record-stat-num">
                      {(records.bomb?.bestScore || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="record-stat-box">
                    <span className="record-stat-lbl">BOMBS TRIGGERED</span>
                    <span className="record-stat-num">{records.bomb?.bombsTriggered || 0}</span>
                  </div>
                </div>
              </div>

              {/* Ice Mode */}
              <div className="record-card">
                <div className="record-card-header">
                  <div className="record-icon ice-bg">
                    <Snowflake size={20} />
                  </div>
                  <span className="record-mode-title">ICE MODE</span>
                </div>
                <div className="record-stats-row">
                  <div className="record-stat-box">
                    <span className="record-stat-lbl">BEST SCORE</span>
                    <span className="record-stat-num">
                      {(records.ice?.bestScore || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="record-stat-box">
                    <span className="record-stat-lbl">ICE CLEARED</span>
                    <span className="record-stat-num">{records.ice?.iceCleared || 0}</span>
                  </div>
                </div>
              </div>

              {/* Daily Challenge */}
              <div className="record-card">
                <div className="record-card-header">
                  <div className="record-icon daily-bg">
                    <Calendar size={20} />
                  </div>
                  <span className="record-mode-title">DAILY CHALLENGE</span>
                </div>
                <div className="record-stats-row">
                  <div className="record-stat-box">
                    <span className="record-stat-lbl">CURRENT STREAK</span>
                    <span className="record-stat-num">
                      <Flame size={14} style={{ display: 'inline', color: '#F59E0B' }} />{' '}
                      {records.daily?.streak?.currentStreak || 0}d
                    </span>
                  </div>
                  <div className="record-stat-box">
                    <span className="record-stat-lbl">BEST STREAK</span>
                    <span className="record-stat-num">
                      {records.daily?.streak?.bestStreak || 0}d
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="online-mode-selector">
              {(
                [
                  'CLASSIC',
                  'ENDLESS',
                  'TIME_ATTACK',
                  'MOVES_CHALLENGE',
                  'HARDCORE',
                  'MEGA_BOARD',
                  'BOMB',
                  'ICE',
                  'DAILY_CHALLENGE',
                ] as GameMode[]
              ).map((m) => (
                <button
                  key={m}
                  className={`online-mode-pill ${selectedOnlineMode === m ? 'active' : ''}`}
                  onClick={() => setSelectedOnlineMode(m)}
                >
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="online-loading">Loading live leaderboard...</div>
            ) : onlineEntries.length === 0 ? (
              <div className="online-empty">No scores recorded yet for this mode.</div>
            ) : (
              <div className="leaderboard-table">
                <div className="table-header-row">
                  <span>#</span>
                  <span>PLAYER</span>
                  <span>SCORE</span>
                  <span>TILE</span>
                </div>
                {onlineEntries.map((entry, idx) => (
                  <div key={entry.id || idx} className="table-data-row">
                    <span className="rank-col">{idx + 1}</span>
                    <span className="name-col">{entry.playerName}</span>
                    <span className="score-col">{entry.score.toLocaleString()}</span>
                    <span className="tile-col">{entry.highestTile}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

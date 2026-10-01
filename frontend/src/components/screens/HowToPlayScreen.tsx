import React from 'react';
import { ArrowLeft, Hand, Bomb, Snowflake, Calendar } from 'lucide-react';
import './HowToPlayScreen.css';

interface HowToPlayScreenProps {
  onBack: () => void;
}

export const HowToPlayScreen: React.FC<HowToPlayScreenProps> = ({ onBack }) => {
  return (
    <div className="screen sub-screen">
      <header className="sub-header">
        <button className="btn btn-icon" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h2>HOW TO PLAY</h2>
        <div style={{ width: 44 }} />
      </header>

      <div className="sub-content">
        <div className="instructions-list">
          {/* Rule 1 */}
          <div className="rule-card">
            <div className="rule-num">1</div>
            <div className="rule-body">
              <h4>Swipe the board</h4>
              <p>Drag your finger left, right, up, or down across the board.</p>
              <div className="rule-visual">
                <Hand size={24} className="hand-icon" />
              </div>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="rule-card">
            <div className="rule-num">2</div>
            <div className="rule-body">
              <h4>Merge into larger tiles</h4>
              <p>Identical adjacent tiles combine into one double-value tile.</p>
              <div className="rule-visual flex-row">
                <div className="visual-tile t-2">2</div>
                <span>+</span>
                <div className="visual-tile t-2">2</div>
                <span>→</span>
                <div className="visual-tile t-4">4</div>
              </div>
            </div>
          </div>

          {/* Rule 3: Bomb Mode */}
          <div className="rule-card">
            <div className="rule-num"><Bomb size={16} /></div>
            <div className="rule-body">
              <h4>Bomb Mode</h4>
              <p>Merge tiles adjacent to a Bomb to detonate a 3×3 surrounding area!</p>
            </div>
          </div>

          {/* Rule 4: Ice Mode */}
          <div className="rule-card">
            <div className="rule-num"><Snowflake size={16} /></div>
            <div className="rule-body">
              <h4>Ice Mode</h4>
              <p>Perform 3 adjacent merges nearby to shatter frozen tiles (1/3 → 3/3).</p>
            </div>
          </div>

          {/* Rule 5: Daily Challenge */}
          <div className="rule-card">
            <div className="rule-num"><Calendar size={16} /></div>
            <div className="rule-body">
              <h4>Daily Challenge</h4>
              <p>A new offline puzzle every day. Win to build your daily streak 🔥!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { ChevronRight, CheckCircle2, Hand } from 'lucide-react';
import { useSwipe } from '../../hooks/useSwipe';
import { Direction } from '../../types/game';
import './Tutorial.css';

interface TutorialProps {
  onComplete: () => void;
}

export const Tutorial: React.FC<TutorialProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [demoMerged, setDemoMerged] = useState<boolean>(false);
  const boardRef = useRef<HTMLDivElement>(null);

  // Interactive swipe step
  useSwipe(boardRef, {
    onSwipe: (dir: Direction) => {
      if (currentStep === 1 || currentStep === 3) {
        setDemoMerged(true);
        setTimeout(() => {
          if (currentStep < 5) {
            setCurrentStep((prev) => prev + 1);
          }
        }, 500);
      }
    },
    disabled: false,
  });

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="screen tutorial-screen">
      <div className="tutorial-header">
        <h2>HOW TO PLAY</h2>
        <div className="step-indicator">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={`dot_${idx}`}
              className={`step-dot ${idx + 1 === currentStep ? 'active' : idx + 1 < currentStep ? 'completed' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="tutorial-content">
        {currentStep === 1 && (
          <div className="tutorial-card">
            <h3>Step 1: Swipe the tiles</h3>
            <p>Drag your finger directly across the board in any direction to move tiles.</p>
            <div ref={boardRef} className="interactive-board-preview">
              <div className="swipe-hand-anim">
                <Hand size={36} />
              </div>
              <div className="demo-tile t-2 pos-left">2</div>
              <div className="demo-tile t-2 pos-right">2</div>
            </div>
            <p className="hint-text">Try swiping on the board above!</p>
          </div>
        )}

        {currentStep === 2 && (
          <div className="tutorial-card">
            <h3>Step 2: Match same numbers</h3>
            <p>When two tiles with the same number touch during a swipe...</p>
            <div className="visual-match-preview">
              <div className="demo-tile t-2">2</div>
              <span className="plus-sign">+</span>
              <div className="demo-tile t-2">2</div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="tutorial-card">
            <h3>Step 3: Merge them</h3>
            <p>They merge into one larger tile with double the value!</p>
            <div className="visual-merge-preview">
              <div className="demo-tile t-2">2</div>
              <span className="plus-sign">+</span>
              <div className="demo-tile t-2">2</div>
              <span className="arrow-sign">→</span>
              <div className="demo-tile t-4 tile-merged">4</div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="tutorial-card">
            <h3>Step 4: Create bigger numbers</h3>
            <p>Keep merging identical tiles to build higher values.</p>
            <div className="visual-chain-preview">
              <div className="demo-tile t-4">4</div>
              <span className="arrow-sm">→</span>
              <div className="demo-tile t-8">8</div>
              <span className="arrow-sm">→</span>
              <div className="demo-tile t-16">16</div>
              <span className="arrow-sm">→</span>
              <div className="demo-tile t-32">32</div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="tutorial-card">
            <h3>Step 5: Reach 2048</h3>
            <p>Combine tiles up to 2048 and keep going for high scores!</p>
            <div className="visual-2048-preview">
              <div className="demo-tile t-2048">2048</div>
            </div>
          </div>
        )}
      </div>

      <div className="tutorial-footer">
        <button className="btn btn-primary btn-full" onClick={nextStep}>
          {currentStep === 5 ? (
            <>
              <CheckCircle2 size={20} /> START PLAYING
            </>
          ) : (
            <>
              NEXT <ChevronRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

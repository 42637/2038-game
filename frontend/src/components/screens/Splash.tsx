import React, { useEffect } from 'react';
import './Splash.css';

interface SplashProps {
  onFinish: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash-screen">
      <div className="splash-brand">
        <div className="splash-logo-illustration">
          <div className="logo-tile tile-2">2</div>
          <div className="logo-tile tile-0">0</div>
          <div className="logo-tile tile-4">4</div>
          <div className="logo-tile tile-8">8</div>
        </div>

        <h1 className="splash-title">Merge 2048</h1>
        <p className="splash-subtitle">Offline Puzzle Game</p>
      </div>

      <div className="splash-loader">
        <div className="spinner-dot" />
        <div className="spinner-dot" />
        <div className="spinner-dot" />
      </div>
    </div>
  );
};

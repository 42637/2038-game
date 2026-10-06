import React from 'react';
import { ArrowLeft, ShieldCheck, WifiOff, Code2 } from 'lucide-react';
import './AboutScreen.css';

interface AboutScreenProps {
  onBack: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
  return (
    <div className="screen sub-screen">
      <header className="sub-header">
        <button className="btn btn-icon" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h2>ABOUT</h2>
        <div style={{ width: 44 }} />
      </header>

      <div className="sub-content">
        <div className="about-brand-card">
          <div className="about-tile">2048</div>
          <h3 className="about-app-title">Merge 2048</h3>
          <span className="about-version">Version 1.0.0 (Phase 1)</span>
          <span className="about-badge">Production Mobile Edition</span>
        </div>

        <div className="about-info-group">
          <div className="about-info-item">
            <ShieldCheck className="info-icon" size={22} />
            <div className="info-text">
              <h4>Offline-First Guarantee</h4>
              <p>
                Core gameplay, scores, and statistics are stored locally on your device. Zero internet access or account registration is ever required.
              </p>
            </div>
          </div>

          <div className="about-info-item">
            <Code2 className="info-icon" size={22} />
            <div className="info-text">
              <h4>Modular Game Engine</h4>
              <p>
                Built with React, TypeScript, and a high-performance touch engine optimized for budget and modern mobile viewports.
              </p>
            </div>
          </div>
        </div>

        {/* Standalone System Status */}
        <div className="about-backend-card">
          <div className="backend-status-header">
            <WifiOff size={18} className="wifi-offline" />
            <span className="backend-title">Standalone System Status</span>
          </div>

          <p className="backend-desc">
            100% Offline Standalone Mode Active (Zero network calls)
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  ActiveScreen,
  ChallengeLevel,
  DailyChallengeConfig,
  FirstTimeIntrosState,
  GameMode,
  RecordsState,
  SettingsState,
  StatisticsState,
} from './types/game';
import { storageService } from './services/storage';
import { audioService } from './services/audio';
import { generateDailyChallenge, getTodayDateSeed } from './game/dailyChallengeGenerator';
import { Splash } from './components/screens/Splash';
import { Tutorial } from './components/tutorial/Tutorial';
import { MainMenu } from './components/screens/MainMenu';
import { ChallengeSelectScreen } from './components/screens/ChallengeSelectScreen';
import { DailyChallengeScreen } from './components/screens/DailyChallengeScreen';
import { GameplayScreen } from './components/screens/GameplayScreen';
import { BestScoresScreen } from './components/screens/BestScoresScreen';
import { StatisticsScreen } from './components/screens/StatisticsScreen';
import { HowToPlayScreen } from './components/screens/HowToPlayScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { AboutScreen } from './components/screens/AboutScreen';
import { ModeIntroModal } from './components/modals/ModeIntroModal';
import './styles/index.css';

export const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('SPLASH');
  const [selectedMode, setSelectedMode] = useState<GameMode>('CLASSIC');
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeLevel | undefined>(undefined);
  const [currentDailyChallenge, setCurrentDailyChallenge] = useState<DailyChallengeConfig>(() =>
    generateDailyChallenge(getTodayDateSeed())
  );
  const [pendingIntroMode, setPendingIntroMode] = useState<GameMode | null>(null);

  const [settings, setSettings] = useState<SettingsState>(() => storageService.getSettings());
  const [records, setRecords] = useState<RecordsState>(() => storageService.getRecords());
  const [stats, setStats] = useState<StatisticsState>(() => storageService.getStats());
  const [tutorial, setTutorial] = useState(() => storageService.getTutorial());
  const [intros, setIntros] = useState<FirstTimeIntrosState>(() => storageService.getFirstTimeIntros());

  // Ambient music toggle
  useEffect(() => {
    audioService.setMusicEnabled(settings.musicEnabled);
  }, [settings.musicEnabled]);

  // Apply visual theme to document root
  useEffect(() => {
    const activeTheme = (settings.theme || 'CLASSIC').toLowerCase();
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [settings.theme]);

  const handleSplashFinish = () => {
    if (!tutorial.completed) {
      setActiveScreen('TUTORIAL');
    } else {
      setActiveScreen('MAIN_MENU');
    }
  };

  const handleTutorialComplete = () => {
    const updated = { completed: true };
    setTutorial(updated);
    storageService.saveTutorial(updated);
    setActiveScreen('MAIN_MENU');
  };

  const handleSelectMode = (mode: GameMode) => {
    setSelectedMode(mode);

    // Check first time mode intro requirements
    if (mode === 'MOVES_CHALLENGE' && !intros.movesChallengeShown) {
      setPendingIntroMode('MOVES_CHALLENGE');
      return;
    }
    if (mode === 'HARDCORE' && !intros.hardcoreShown) {
      setPendingIntroMode('HARDCORE');
      return;
    }
    if (mode === 'MEGA_BOARD' && !intros.megaBoardShown) {
      setPendingIntroMode('MEGA_BOARD');
      return;
    }
    if (mode === 'BOMB' && !intros.bombShown) {
      setPendingIntroMode('BOMB');
      return;
    }
    if (mode === 'ICE' && !intros.iceShown) {
      setPendingIntroMode('ICE');
      return;
    }
    if (mode === 'DAILY_CHALLENGE' && !intros.dailyShown) {
      setPendingIntroMode('DAILY_CHALLENGE');
      return;
    }

    // Direct mode navigation
    if (mode === 'MOVES_CHALLENGE') {
      setActiveScreen('CHALLENGE_SELECT');
    } else if (mode === 'DAILY_CHALLENGE') {
      setCurrentDailyChallenge(generateDailyChallenge(getTodayDateSeed()));
      setActiveScreen('DAILY_CHALLENGE');
    } else {
      if (mode === 'HARDCORE') {
        audioService.playHardcoreStartSound(settings.soundEnabled);
      } else if (mode === 'MEGA_BOARD') {
        audioService.playMegaBoardStartSound(settings.soundEnabled);
      }
      setSelectedChallenge(undefined);
      setActiveScreen('GAMEPLAY');
    }
  };

  const handleConfirmIntro = () => {
    if (!pendingIntroMode) return;
    const mode = pendingIntroMode;
    const updatedIntros = { ...intros };

    if (mode === 'MOVES_CHALLENGE') updatedIntros.movesChallengeShown = true;
    if (mode === 'HARDCORE') updatedIntros.hardcoreShown = true;
    if (mode === 'MEGA_BOARD') updatedIntros.megaBoardShown = true;
    if (mode === 'BOMB') updatedIntros.bombShown = true;
    if (mode === 'ICE') updatedIntros.iceShown = true;
    if (mode === 'DAILY_CHALLENGE') updatedIntros.dailyShown = true;

    setIntros(updatedIntros);
    storageService.saveFirstTimeIntros(updatedIntros);
    setPendingIntroMode(null);

    if (mode === 'MOVES_CHALLENGE') {
      setActiveScreen('CHALLENGE_SELECT');
    } else if (mode === 'DAILY_CHALLENGE') {
      setCurrentDailyChallenge(generateDailyChallenge(getTodayDateSeed()));
      setActiveScreen('DAILY_CHALLENGE');
    } else {
      if (mode === 'HARDCORE') {
        audioService.playHardcoreStartSound(settings.soundEnabled);
      } else if (mode === 'MEGA_BOARD') {
        audioService.playMegaBoardStartSound(settings.soundEnabled);
      }
      setSelectedChallenge(undefined);
      setActiveScreen('GAMEPLAY');
    }
  };

  const handleSelectChallengeLevel = (level: ChallengeLevel) => {
    setSelectedMode('MOVES_CHALLENGE');
    setSelectedChallenge(level);
    setActiveScreen('GAMEPLAY');
  };

  const handleStartDailyChallengeGameplay = () => {
    setSelectedMode('DAILY_CHALLENGE');
    setSelectedChallenge(undefined);
    setActiveScreen('GAMEPLAY');
  };

  const handleUpdateSettings = (newSettings: SettingsState) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
  };

  const handleUpdateRecords = (newRecords: RecordsState) => {
    setRecords(newRecords);
    storageService.saveRecords(newRecords);
  };

  const handleUpdateStats = (newStats: StatisticsState) => {
    setStats(newStats);
    storageService.saveStats(newStats);
  };

  const handleResetProgress = () => {
    storageService.resetAllProgress();
    setRecords(storageService.getRecords());
    setStats(storageService.getStats());
    setSettings(storageService.getSettings());
    setTutorial(storageService.getTutorial());
    setIntros(storageService.getFirstTimeIntros());
    setActiveScreen('MAIN_MENU');
  };

  return (
    <div className="app-container">
      {activeScreen === 'SPLASH' && <Splash onFinish={handleSplashFinish} />}

      {activeScreen === 'TUTORIAL' && <Tutorial onComplete={handleTutorialComplete} />}

      {activeScreen === 'MAIN_MENU' && (
        <MainMenu
          records={records}
          boardSize={settings.boardSize}
          onSelectBoardSize={(size) => handleUpdateSettings({ ...settings, boardSize: size })}
          onSelectMode={handleSelectMode}
          onNavigate={(screen) => setActiveScreen(screen)}
        />
      )}

      {activeScreen === 'CHALLENGE_SELECT' && (
        <ChallengeSelectScreen
          records={records.movesChallenge}
          onSelectChallenge={handleSelectChallengeLevel}
          onBack={() => setActiveScreen('MAIN_MENU')}
        />
      )}

      {activeScreen === 'DAILY_CHALLENGE' && (
        <DailyChallengeScreen
          challenge={currentDailyChallenge}
          records={records}
          onStartChallenge={handleStartDailyChallengeGameplay}
          onBack={() => setActiveScreen('MAIN_MENU')}
        />
      )}

      {activeScreen === 'GAMEPLAY' && (
        <GameplayScreen
          mode={selectedMode}
          challengeLevel={selectedChallenge}
          dailyChallenge={currentDailyChallenge}
          settings={settings}
          records={records}
          stats={stats}
          onUpdateRecords={handleUpdateRecords}
          onUpdateStats={handleUpdateStats}
          onSelectChallenge={handleSelectChallengeLevel}
          onMainMenu={() => setActiveScreen('MAIN_MENU')}
        />
      )}

      {activeScreen === 'BEST_SCORES' && (
        <BestScoresScreen records={records} onBack={() => setActiveScreen('MAIN_MENU')} />
      )}

      {activeScreen === 'STATISTICS' && (
        <StatisticsScreen
          stats={stats}
          records={records}
          onBack={() => setActiveScreen('MAIN_MENU')}
        />
      )}

      {activeScreen === 'HOW_TO_PLAY' && (
        <HowToPlayScreen onBack={() => setActiveScreen('MAIN_MENU')} />
      )}

      {activeScreen === 'SETTINGS' && (
        <SettingsScreen
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onResetProgress={handleResetProgress}
          onNavigate={(screen) => setActiveScreen(screen)}
          onBack={() => setActiveScreen('MAIN_MENU')}
        />
      )}

      {activeScreen === 'ABOUT' && (
        <AboutScreen onBack={() => setActiveScreen('MAIN_MENU')} />
      )}

      {/* First-Time Mode Intro Modal */}
      {pendingIntroMode && (
        <ModeIntroModal
          mode={pendingIntroMode}
          onStart={handleConfirmIntro}
          onCancel={() => setPendingIntroMode(null)}
        />
      )}
    </div>
  );
};

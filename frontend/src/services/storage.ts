import { gameStorage } from '../utils/gameStorage';
import {
  FirstTimeIntrosState,
  GameState,
  RecordsState,
  SettingsState,
  StatisticsState,
  TutorialState,
} from '../types/game';

export {
  DEFAULT_SETTINGS,
  DEFAULT_RECORDS,
  DEFAULT_STATS,
  DEFAULT_TUTORIAL,
  DEFAULT_FIRST_TIME_INTROS,
  gameStorage,
} from '../utils/gameStorage';

export const storageService = {
  getSettings: (): SettingsState => gameStorage.loadSettings(),
  saveSettings: (settings: SettingsState): void => gameStorage.saveSettings(settings),

  getRecords: (): RecordsState => gameStorage.loadRecords(),
  saveRecords: (records: RecordsState): void => gameStorage.saveRecords(records),

  getStats: (): StatisticsState => gameStorage.loadStats(),
  saveStats: (stats: StatisticsState): void => gameStorage.saveStats(stats),

  getTutorial: (): TutorialState => gameStorage.loadTutorial(),
  saveTutorial: (tutorial: TutorialState): void => gameStorage.saveTutorial(tutorial),

  getFirstTimeIntros: (): FirstTimeIntrosState => gameStorage.loadFirstTimeIntros(),
  saveFirstTimeIntros: (intros: FirstTimeIntrosState): void =>
    gameStorage.saveFirstTimeIntros(intros),

  getGameState: (): GameState | null => gameStorage.loadGameState(),
  saveGameState: (state: GameState | null): void => gameStorage.saveGameState(state),

  resetAllProgress: (): void => gameStorage.resetAllProgress(),
};


import { GameMode } from '../types/game';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location) {
    return `http://${window.location.hostname}:4050/api`;
  }
  return 'http://localhost:4050/api';
};

const API_BASE_URL = getApiBaseUrl();

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export interface VersionResponse {
  version: string;
  phase: number;
  apiVersion: string;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  mode: GameMode;
  score: number;
  highestTile: number;
  moves: number;
  challengeLevelId?: number;
  date: string;
}

export interface ScoreSubmissionPayload {
  playerName?: string;
  mode: GameMode;
  score: number;
  highestTile: number;
  moves: number;
  challengeLevelId?: number;
}

export interface ScoreSubmissionResponse {
  success: boolean;
  entry?: LeaderboardEntry;
  rank?: number;
  isNewBest?: boolean;
}

export const apiService = {
  checkHealth: async (): Promise<HealthResponse | null> => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
      clearTimeout(id);
      if (!res.ok) return null;
      return (await res.json()) as HealthResponse;
    } catch {
      return null;
    }
  },

  getVersion: async (): Promise<VersionResponse | null> => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE_URL}/version`, { signal: controller.signal });
      clearTimeout(id);
      if (!res.ok) return null;
      return (await res.json()) as VersionResponse;
    } catch {
      return null;
    }
  },

  getLeaderboard: async (mode?: GameMode): Promise<LeaderboardEntry[]> => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2500);
      const url = mode ? `${API_BASE_URL}/leaderboard?mode=${mode}` : `${API_BASE_URL}/leaderboard`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (!res.ok) return [];
      const data = await res.json();
      return data.leaderboard || [];
    } catch {
      return [];
    }
  },

  submitScore: async (payload: ScoreSubmissionPayload): Promise<ScoreSubmissionResponse | null> => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${API_BASE_URL}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(id);
      if (!res.ok) return null;
      return (await res.json()) as ScoreSubmissionResponse;
    } catch {
      return null;
    }
  },

  sendTelemetry: async (event: string, data: Record<string, unknown> = {}): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE_URL}/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, data, timestamp: new Date().toISOString() }),
        signal: controller.signal,
      });
      clearTimeout(id);
      return res.ok;
    } catch {
      return false;
    }
  },
};

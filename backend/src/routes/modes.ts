import { Router, Request, Response } from 'express';
import {
  BACKEND_CHALLENGE_LEVELS,
  BACKEND_GAME_MODE_CONFIGS,
  GameMode,
  leaderboardStore,
} from '../gameModes.js';

const modesRouter = Router();

// GET /api/modes - Get all mode configurations
modesRouter.get('/modes', (_req: Request, res: Response) => {
  res.json({
    success: true,
    modes: Object.values(BACKEND_GAME_MODE_CONFIGS),
  });
});

// GET /api/challenges - Get all move challenge level definitions
modesRouter.get('/challenges', (_req: Request, res: Response) => {
  res.json({
    success: true,
    challenges: BACKEND_CHALLENGE_LEVELS,
  });
});

// GET /api/leaderboard - Get leaderboard entries (optional ?mode=CLASSIC)
modesRouter.get('/leaderboard', (req: Request, res: Response) => {
  const modeQuery = req.query.mode as GameMode | undefined;
  const leaderboard = leaderboardStore.getLeaderboard(modeQuery);
  res.json({
    success: true,
    mode: modeQuery || 'ALL',
    count: leaderboard.length,
    leaderboard,
  });
});

// POST /api/scores - Submit a game score
modesRouter.post('/scores', (req: Request, res: Response) => {
  const { mode, score, highestTile, moves, playerName, challengeLevelId } = req.body || {};

  if (!mode || typeof score !== 'number' || score < 0) {
    res.status(400).json({ success: false, message: 'Invalid score submission payload' });
    return;
  }

  const result = leaderboardStore.addScore({
    mode,
    score,
    highestTile: highestTile || 2,
    moves: moves || 0,
    playerName,
    challengeLevelId,
  });

  res.json({
    success: true,
    entry: result.entry,
    rank: result.rank,
    isNewBest: result.isNewBest,
  });
});

// GET /api/stats - Aggregate backend game mode statistics
modesRouter.get('/stats', (_req: Request, res: Response) => {
  const stats = leaderboardStore.getGlobalStats();
  res.json({
    success: true,
    stats,
  });
});

export default modesRouter;

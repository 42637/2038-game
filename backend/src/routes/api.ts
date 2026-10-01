import { Router, Request, Response } from 'express';
import { config } from '../config/env.js';
import modesRouter from './modes.js';

const router = Router();

// Mount Modes & Leaderboard routes
router.use('/', modesRouter);

// GET /api/health
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Merge 2048 Backend',
    timestamp: new Date().toISOString(),
  });
});

// GET /api/version
router.get('/version', (_req: Request, res: Response) => {
  res.json({
    version: config.version,
    phase: config.phase,
    apiVersion: 'v1',
  });
});

// POST /api/telemetry (Optional anonymous telemetry foundation)
router.post('/telemetry', (req: Request, res: Response) => {
  const { event, data } = req.body || {};
  console.log(`[Telemetry Log] Event: ${event || 'UNKNOWN'}`, data || {});
  res.json({ success: true, logged: true });
});

export default router;


import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import apiRoutes from './routes/api.js';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Root Fallback
app.get('/', (_req, res) => {
  res.json({
    message: 'Merge 2048 Backend API Foundation',
    healthEndpoint: '/api/health',
    versionEndpoint: '/api/version',
  });
});

app.listen(config.port, '0.0.0.0', () => {
  console.log(`Merge 2048 Backend running on http://0.0.0.0:${config.port}`);
});

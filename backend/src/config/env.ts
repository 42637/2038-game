import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 4050,
  env: process.env.NODE_ENV || 'development',
  version: '1.0.0',
  phase: 1,
};

import assert from 'node:assert';
import { BACKEND_GAME_MODE_CONFIGS, BACKEND_CHALLENGE_LEVELS, leaderboardStore } from '../gameModes.js';

console.log('Running Backend Game Modes & Leaderboard Tests...');

// 1. Verify 6 Game Modes
const modes = Object.keys(BACKEND_GAME_MODE_CONFIGS);
assert.strictEqual(modes.length, 6, 'Should have 6 game modes');
assert.ok(modes.includes('CLASSIC'), 'CLASSIC mode missing');
assert.ok(modes.includes('ENDLESS'), 'ENDLESS mode missing');
assert.ok(modes.includes('TIME_ATTACK'), 'TIME_ATTACK mode missing');
assert.ok(modes.includes('MOVES_CHALLENGE'), 'MOVES_CHALLENGE mode missing');
assert.ok(modes.includes('HARDCORE'), 'HARDCORE mode missing');
assert.ok(modes.includes('MEGA_BOARD'), 'MEGA_BOARD mode missing');
console.log('✔ All 6 Game Mode Configurations validated.');

// 2. Verify 7 Move Challenge Levels
assert.strictEqual(BACKEND_CHALLENGE_LEVELS.length, 7, 'Should have 7 move challenge levels');
assert.strictEqual(BACKEND_CHALLENGE_LEVELS[0].targetTile, 32, 'Level 1 target should be 32');
assert.strictEqual(BACKEND_CHALLENGE_LEVELS[6].targetTile, 2048, 'Level 7 target should be 2048');
console.log('✔ All 7 Moves Challenge Levels validated.');

// 3. Test Score Submission and Leaderboard
const res = leaderboardStore.addScore({
  playerName: 'MasterPlayer',
  mode: 'HARDCORE',
  score: 99999,
  highestTile: 4096,
  moves: 450,
});
assert.strictEqual(res.rank, 1, 'Top score should get rank 1');
assert.strictEqual(res.isNewBest, true, 'Top score should be marked new best');

const hardcoreLeaderboard = leaderboardStore.getLeaderboard('HARDCORE');
assert.strictEqual(hardcoreLeaderboard[0].playerName, 'MasterPlayer', 'Leaderboard top entry should be MasterPlayer');
assert.strictEqual(hardcoreLeaderboard[0].score, 99999, 'Leaderboard score should be 99999');
console.log('✔ Leaderboard score submission and ranking validated.');

// 4. Test Global Stats
const stats = leaderboardStore.getGlobalStats();
assert.ok(stats.totalSubmissions > 0, 'Total submissions should be > 0');
assert.ok(stats.totalScore > 0, 'Total score should be > 0');
assert.ok(stats.maxHighestTile >= 4096, 'Max tile should be >= 4096');
console.log('✔ Global stats calculations validated.');

console.log('All backend tests passed successfully!');

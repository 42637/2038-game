import { describe, it, expect } from 'vitest';
import { createEmptyBoard, moveBoard } from '../engine';
import { processSpecialTilesAfterMove, spawnSpecialTile } from '../specialTileManager';
import { generateDailyChallenge, hashDateString } from '../dailyChallengeGenerator';
import { Tile } from '../../types/game';

describe('Phase 3 Special Tile Manager & Daily Challenge Engine', () => {
  it('spawns a BOMB tile correctly', () => {
    const emptyBoard = createEmptyBoard(4);
    const { board, newTile } = spawnSpecialTile(emptyBoard, 'BOMB', 4);
    expect(newTile).not.toBeNull();
    expect(newTile?.specialType).toBe('BOMB');
    expect(board[newTile!.row][newTile!.col]?.specialType).toBe('BOMB');
  });

  it('spawns an ICE tile correctly with frozen state', () => {
    const emptyBoard = createEmptyBoard(4);
    const { board, newTile } = spawnSpecialTile(emptyBoard, 'ICE', 4);
    expect(newTile).not.toBeNull();
    expect(newTile?.specialType).toBe('ICE');
    expect(newTile?.isFrozen).toBe(true);
    expect(newTile?.iceHitCount).toBe(0);
  });

  it('defuses a bomb (+300 PTS bonus) when adjacent merge occurs', () => {
    const board = createEmptyBoard(4);
    const bombTile: Tile = { id: 'bomb', value: 0, row: 1, col: 1, specialType: 'BOMB', fuseTimer: 2 };
    board[1][1] = bombTile;

    board[0][0] = { id: 't1', value: 2, row: 0, col: 0 };
    board[0][1] = { id: 't2', value: 4, row: 0, col: 1 };

    // Adjacent merge at (0, 1) DEFUSES the bomb!
    const mergedPositions = [{ row: 0, col: 1 }];
    const result = processSpecialTilesAfterMove(board, mergedPositions, 4);

    expect(result.bombsDefusedCount).toBe(1);
    expect(result.pointsGained).toBe(300); // Defusal bonus!
    expect(result.board[1][1]).toBeNull(); // Bomb defused & removed safely
    expect(result.board[0][0]?.value).toBe(2); // Surrounding tile preserved!
  });

  it('explodes bomb with -200 PTS penalty when 2-move fuse expires without defusal', () => {
    const board = createEmptyBoard(4);
    const bombTile: Tile = { id: 'bomb', value: 0, row: 1, col: 1, specialType: 'BOMB', fuseTimer: 1 };
    board[1][1] = bombTile;

    board[0][0] = { id: 't1', value: 4, row: 0, col: 0 }; // Clutter tile
    board[0][2] = { id: 't2', value: 64, row: 0, col: 2 }; // High value tile (protected)

    // Move with NO adjacent merge -> Fuse expires!
    const result = processSpecialTilesAfterMove(board, [], 4);

    expect(result.bombsDetonatedCount).toBe(1);
    expect(result.pointsGained).toBe(-200); // Exploded penalty!
    expect(result.board[1][1]).toBeNull(); // Bomb exploded
    expect(result.board[0][0]).toBeNull(); // Clutter tile (4) cleared
    expect(result.board[0][2]?.value).toBe(64); // High value tile (64) INTACT!
  });

  it('unfreezes ice tile after 3 adjacent merge hits', () => {
    let board = createEmptyBoard(4);
    const iceTile: Tile = {
      id: 'ice',
      value: 4,
      row: 1,
      col: 1,
      specialType: 'ICE',
      isFrozen: true,
      iceHitCount: 0,
    };
    board[1][1] = iceTile;

    const mergedPositions = [{ row: 0, col: 1 }];

    // Hit 1
    let res = processSpecialTilesAfterMove(board, mergedPositions, 4);
    expect(res.board[1][1]?.iceHitCount).toBe(1);
    expect(res.board[1][1]?.isFrozen).toBe(true);

    // Hit 2
    res = processSpecialTilesAfterMove(res.board, mergedPositions, 4);
    expect(res.board[1][1]?.iceHitCount).toBe(2);
    expect(res.board[1][1]?.isFrozen).toBe(true);

    // Hit 3 -> Unfreezes!
    res = processSpecialTilesAfterMove(res.board, mergedPositions, 4);
    expect(res.iceUnfrozenCount).toBe(1);
    expect(res.board[1][1]?.isFrozen).toBe(false);
    expect(res.board[1][1]?.specialType).toBeUndefined();
    expect(res.board[1][1]?.value).toBe(4);
  });

  it('generates deterministic daily challenges for the same date seed', () => {
    const date1 = '2026-09-15';
    const challengeA = generateDailyChallenge(date1);
    const challengeB = generateDailyChallenge(date1);

    expect(challengeA.dateSeed).toBe(date1);
    expect(challengeA.title).toBe(challengeB.title);
    expect(challengeA.targetTile).toBe(challengeB.targetTile);
    expect(challengeA.moveLimit).toBe(challengeB.moveLimit);

    const date2 = '2026-09-16';
    const challengeC = generateDailyChallenge(date2);
    expect(hashDateString(date1)).not.toBe(hashDateString(date2));
    expect(challengeC.dateSeed).toBe(date2);
  });

  it('keeps frozen ICE tiles stationary during swipes', () => {
    const board = createEmptyBoard(4);
    // Row 0: null, IceTile(4) at (0,1), Tile(2) at (0,2), Tile(2) at (0,3)
    const iceTile: Tile = { id: 'ice', value: 4, row: 0, col: 1, specialType: 'ICE', isFrozen: true };
    board[0][1] = iceTile;
    board[0][2] = { id: 't2', value: 2, row: 0, col: 2 };
    board[0][3] = { id: 't3', value: 2, row: 0, col: 3 };

    // Move LEFT
    const result = moveBoard(board, 'LEFT', 4);

    expect(result.moved).toBe(true);
    // Frozen tile MUST stay at (0, 1)
    expect(result.board[0][1]?.isFrozen).toBe(true);
    expect(result.board[0][1]?.col).toBe(1);
    // Tiles at (0,2) and (0,3) merge at (0,2) within segment [2..3]
    expect(result.board[0][2]?.value).toBe(4);
    expect(result.board[0][3]).toBeNull();
  });
});

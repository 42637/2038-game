import { describe, it, expect } from 'vitest';
import {
  createEmptyBoard,
  initializeBoard,
  moveBoard,
  hasValidMoves,
  getHighestTileOnBoard,
} from '../engine';
import { Tile } from '../../types/game';

describe('Game Engine', () => {
  it('creates an empty 4x4 board', () => {
    const board = createEmptyBoard(4);
    expect(board.length).toBe(4);
    expect(board[0].length).toBe(4);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        expect(board[r][c]).toBeNull();
      }
    }
  });

  it('initializes a board with 2 non-null tiles', () => {
    const board = initializeBoard(4);
    let count = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] !== null) count++;
      }
    }
    expect(count).toBe(2);
  });

  it('merges identical adjacent tiles correctly on move LEFT', () => {
    const board = createEmptyBoard(4);
    const t1: Tile = { id: '1', value: 2, row: 0, col: 0 };
    const t2: Tile = { id: '2', value: 2, row: 0, col: 1 };
    board[0][0] = t1;
    board[0][1] = t2;

    const result = moveBoard(board, 'LEFT', 4);
    expect(result.moved).toBe(true);
    expect(result.scoreGained).toBe(4);
    expect(result.board[0][0]?.value).toBe(4);
    expect(result.board[0][1]).toBeNull();
  });

  it('handles four identical tiles in a row without triple-merging in one turn', () => {
    const board = createEmptyBoard(4);
    board[0][0] = { id: '1', value: 2, row: 0, col: 0 };
    board[0][1] = { id: '2', value: 2, row: 0, col: 1 };
    board[0][2] = { id: '3', value: 2, row: 0, col: 2 };
    board[0][3] = { id: '4', value: 2, row: 0, col: 3 };

    const result = moveBoard(board, 'LEFT', 4);
    expect(result.moved).toBe(true);
    expect(result.scoreGained).toBe(8); // 4 + 4
    expect(result.board[0][0]?.value).toBe(4);
    expect(result.board[0][1]?.value).toBe(4);
    expect(result.board[0][2]).toBeNull();
    expect(result.board[0][3]).toBeNull();
  });

  it('does not move or spawn score on an invalid move direction', () => {
    const board = createEmptyBoard(4);
    board[0][0] = { id: '1', value: 2, row: 0, col: 0 };
    board[1][0] = { id: '2', value: 4, row: 1, col: 0 };

    const result = moveBoard(board, 'LEFT', 4);
    expect(result.moved).toBe(false);
    expect(result.scoreGained).toBe(0);
  });

  it('correctly detects hasValidMoves when board is full vs stuck', () => {
    const board = createEmptyBoard(4);
    let val = 2;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        board[r][c] = { id: `t_${r}_${c}`, value: val, row: r, col: c };
        val = val === 2 ? 4 : 2;
      }
      val = r % 2 === 0 ? 4 : 2;
    }

    expect(hasValidMoves(board, 4)).toBe(false);

    board[0][0] = { id: 't_0_0', value: 2, row: 0, col: 0 };
    board[0][1] = { id: 't_0_1', value: 2, row: 0, col: 1 };
    expect(hasValidMoves(board, 4)).toBe(true);
  });

  it('calculates highest tile on board correctly', () => {
    const board = createEmptyBoard(4);
    board[0][0] = { id: '1', value: 2, row: 0, col: 0 };
    board[2][3] = { id: '2', value: 2048, row: 2, col: 3 };
    expect(getHighestTileOnBoard(board)).toBe(2048);
  });
});

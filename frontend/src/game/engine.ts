import { BoardMatrix, Direction, MoveResult, Tile } from '../types/game';

let tileIdCounter = 0;
export const generateTileId = (): string => {
  tileIdCounter += 1;
  return `tile_${Date.now()}_${tileIdCounter}_${Math.random().toString(36).substr(2, 5)}`;
};

/**
 * Creates an empty N x N board matrix
 */
export const createEmptyBoard = (size: number = 4): BoardMatrix => {
  const board: BoardMatrix = [];
  for (let r = 0; r < size; r++) {
    const row: (Tile | null)[] = [];
    for (let c = 0; c < size; c++) {
      row.push(null);
    }
    board.push(row);
  }
  return board;
};

/**
 * Deep clones the board matrix
 */
export const cloneBoard = (board: BoardMatrix): BoardMatrix => {
  return board.map((row, r) =>
    row.map((cell, c) => {
      if (!cell) return null;
      return {
        ...cell,
        row: r,
        col: c,
        mergedFrom: cell.mergedFrom ? [...cell.mergedFrom] : undefined,
      };
    })
  );
};

/**
 * Finds all empty cell positions (row, col)
 */
export const getEmptyCells = (board: BoardMatrix, size: number = board.length): { row: number; col: number }[] => {
  const emptyCells: { row: number; col: number }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!board[r]?.[c]) {
        emptyCells.push({ row: r, col: c });
      }
    }
  }
  return emptyCells;
};

/**
 * Spawns a new tile (90% chance 2, 10% chance 4) on a random empty cell
 */
export const spawnTile = (board: BoardMatrix, size: number = board.length): { board: BoardMatrix; newTile: Tile | null } => {
  const emptyCells = getEmptyCells(board, size);
  if (emptyCells.length === 0) {
    return { board, newTile: null };
  }

  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  const { row, col } = emptyCells[randomIndex];
  const value = Math.random() < 0.9 ? 2 : 4;

  const newTile: Tile = {
    id: generateTileId(),
    value,
    row,
    col,
    isNew: true,
  };

  const newBoard = cloneBoard(board);
  newBoard[row][col] = newTile;

  return { board: newBoard, newTile };
};

/**
 * Initializes a new board with 2 random tiles
 */
export const initializeBoard = (size: number = 4): BoardMatrix => {
  let board = createEmptyBoard(size);
  const firstSpawn = spawnTile(board, size);
  board = firstSpawn.board;
  const secondSpawn = spawnTile(board, size);
  board = secondSpawn.board;
  return board;
};

/**
 * Moves tiles in a given direction and calculates merges/scoring for N x N board
 */
export const moveBoard = (board: BoardMatrix, direction: Direction, size: number = board.length): MoveResult => {
  const nextBoard = createEmptyBoard(size);
  let scoreGained = 0;
  let moved = false;
  let mergesCount = 0;
  let highestTileMerged = 0;

  for (let i = 0; i < size; i++) {
    // 1. Build line of cells along movement direction
    const line: { tile: Tile; r: number; c: number; index: number }[] = [];

    for (let j = 0; j < size; j++) {
      let r = 0;
      let c = 0;

      switch (direction) {
        case 'LEFT':
          r = i;
          c = j;
          break;
        case 'RIGHT':
          r = i;
          c = size - 1 - j;
          break;
        case 'UP':
          r = j;
          c = i;
          break;
        case 'DOWN':
          r = size - 1 - j;
          c = i;
          break;
      }

      const cell = board[r]?.[c];
      if (cell) {
        line.push({ tile: { ...cell }, r, c, index: j });
      }
    }

    // 2. Identify frozen tile obstacle indices along line (0 to size-1)
    const frozenIndices: number[] = [];
    for (let j = 0; j < size; j++) {
      let r = 0;
      let c = 0;
      switch (direction) {
        case 'LEFT': r = i; c = j; break;
        case 'RIGHT': r = i; c = size - 1 - j; break;
        case 'UP': r = j; c = i; break;
        case 'DOWN': r = size - 1 - j; break;
      }
      const cell = board[r]?.[c];
      if (cell && cell.isFrozen) {
        frozenIndices.push(j);
      }
    }

    // 3. Define segment ranges [start..end] separated by frozen indices
    const segments: { start: number; end: number }[] = [];
    let currentStart = 0;
    for (const fIdx of frozenIndices) {
      if (fIdx > currentStart) {
        segments.push({ start: currentStart, end: fIdx - 1 });
      }
      currentStart = fIdx + 1;
    }
    if (currentStart < size) {
      segments.push({ start: currentStart, end: size - 1 });
    }

    // Place stationary frozen tiles on nextBoard
    for (const fIdx of frozenIndices) {
      let r = 0;
      let c = 0;
      switch (direction) {
        case 'LEFT': r = i; c = fIdx; break;
        case 'RIGHT': r = i; c = size - 1 - fIdx; break;
        case 'UP': r = fIdx; c = i; break;
        case 'DOWN': r = size - 1 - fIdx; c = i; break;
      }
      const originalFrozen = board[r]?.[c];
      if (originalFrozen) {
        nextBoard[r][c] = {
          ...originalFrozen,
          row: r,
          col: c,
          isNew: false,
          isMerged: false,
        };
      }
    }

    // 4. Process non-frozen tiles within each segment
    for (const seg of segments) {
      // Gather tiles in this segment range [seg.start .. seg.end]
      const segTiles = line.filter(
        (item) => !item.tile.isFrozen && item.index >= seg.start && item.index <= seg.end
      );

      const mergedSegTiles: Tile[] = [];
      const mergedCoords: { row: number; col: number; score: number }[] = [];
      let skipNext = false;

      for (let k = 0; k < segTiles.length; k++) {
        if (skipNext) {
          skipNext = false;
          continue;
        }

        const current = segTiles[k];
        const next = segTiles[k + 1];

        if (
          next &&
          current.tile.specialType !== 'BOMB' &&
          next.tile.specialType !== 'BOMB' &&
          current.tile.value > 0 &&
          current.tile.value === next.tile.value
        ) {
          const mergedValue = current.tile.value * 2;
          scoreGained += mergedValue;
          mergesCount += 1;
          if (mergedValue > highestTileMerged) {
            highestTileMerged = mergedValue;
          }

          const mergedTile: Tile = {
            id: generateTileId(),
            value: mergedValue,
            row: 0,
            col: 0,
            mergedFrom: [current.tile, next.tile],
            isMerged: true,
          };

          mergedSegTiles.push(mergedTile);
          skipNext = true;
        } else {
          mergedSegTiles.push({
            ...current.tile,
            isNew: false,
            isMerged: false,
            mergedFrom: undefined,
          });
        }
      }

      // Place merged segment tiles starting from seg.start
      for (let idx = 0; idx < mergedSegTiles.length; idx++) {
        const targetIndex = seg.start + idx;
        let targetRow = 0;
        let targetCol = 0;

        switch (direction) {
          case 'LEFT':
            targetRow = i;
            targetCol = targetIndex;
            break;
          case 'RIGHT':
            targetRow = i;
            targetCol = size - 1 - targetIndex;
            break;
          case 'UP':
            targetRow = targetIndex;
            targetCol = i;
            break;
          case 'DOWN':
            targetRow = size - 1 - targetIndex;
            targetCol = i;
            break;
        }

        const tileToPlace = mergedSegTiles[idx];
        tileToPlace.row = targetRow;
        tileToPlace.col = targetCol;

        if (tileToPlace.isMerged) {
          mergedCoords.push({ row: targetRow, col: targetCol, score: tileToPlace.value });
        }

        nextBoard[targetRow][targetCol] = tileToPlace;

        const originalItem = segTiles[idx];
        if (
          !originalItem ||
          originalItem.r !== targetRow ||
          originalItem.c !== targetCol ||
          tileToPlace.isMerged
        ) {
          moved = true;
        }
      }

      if (segTiles.length !== mergedSegTiles.length) {
        moved = true;
      }
    }
  }

  // Collect all merged coordinates across all lines
  const allMergedCoords: { row: number; col: number; score: number }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const tile = nextBoard[r]?.[c];
      if (tile && tile.isMerged) {
        allMergedCoords.push({ row: r, col: c, score: tile.value });
      }
    }
  }

  return {
    board: nextBoard,
    scoreGained,
    moved,
    mergesCount,
    highestTileMerged,
    mergedCoords: allMergedCoords,
  };
};

/**
 * Checks if any valid merge or move is possible on N x N board
 */
export const hasValidMoves = (board: BoardMatrix, size: number = board.length): boolean => {
  return (
    moveBoard(board, 'LEFT', size).moved ||
    moveBoard(board, 'RIGHT', size).moved ||
    moveBoard(board, 'UP', size).moved ||
    moveBoard(board, 'DOWN', size).moved
  );
};

/**
 * Gets highest tile value on board
 */
export const getHighestTileOnBoard = (board: BoardMatrix): number => {
  let highest = 0;
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < (board[r]?.length || 0); c++) {
      const tile = board[r]?.[c];
      if (tile && tile.value > highest) {
        highest = tile.value;
      }
    }
  }
  return highest;
};

/**
 * Hammer power-up: Destroys single target tile at (row, col)
 */
export const hammerTile = (board: BoardMatrix, row: number, col: number): BoardMatrix => {
  const newBoard = cloneBoard(board);
  if (newBoard[row] && newBoard[row][col]) {
    newBoard[row][col] = null;
  }
  return newBoard;
};

/**
 * Shuffle power-up: Randomizes positions of all non-frozen active tiles
 */
export const shuffleBoard = (board: BoardMatrix, size: number = board.length): BoardMatrix => {
  const newBoard = createEmptyBoard(size);
  const activeTiles: Tile[] = [];
  const occupiedPositions: { row: number; col: number }[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const tile = board[r]?.[c];
      if (tile) {
        if (tile.isFrozen) {
          newBoard[r][c] = { ...tile };
        } else {
          activeTiles.push({ ...tile, isNew: false, isMerged: false });
          occupiedPositions.push({ row: r, col: c });
        }
      }
    }
  }

  // Shuffle active tile positions
  for (let i = occupiedPositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [occupiedPositions[i], occupiedPositions[j]] = [occupiedPositions[j], occupiedPositions[i]];
  }

  activeTiles.forEach((tile, idx) => {
    const pos = occupiedPositions[idx];
    if (pos) {
      newBoard[pos.row][pos.col] = {
        ...tile,
        row: pos.row,
        col: pos.col,
      };
    }
  });

  return newBoard;
};

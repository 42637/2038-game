import { BoardMatrix, SpecialTileType, Tile } from '../types/game';
import { cloneBoard, generateTileId, getEmptyCells } from './engine';

export interface SpecialTileDefinition {
  type: SpecialTileType;
  name: string;
  description: string;
  defaultSpawnChance: number;
}

export const SPECIAL_TILE_DEFINITIONS: Record<SpecialTileType, SpecialTileDefinition> = {
  BOMB: {
    type: 'BOMB',
    name: 'Bomb Tile',
    description: 'Clears a 3x3 surrounding area when activated by an adjacent merge.',
    defaultSpawnChance: 0.1,
  },
  ICE: {
    type: 'ICE',
    name: 'Ice Tile',
    description: 'Frozen tile requiring 3 adjacent merges to unfreeze.',
    defaultSpawnChance: 0.12,
  },
};

export interface ProcessSpecialTilesResult {
  board: BoardMatrix;
  bombsDetonatedCount: number;
  bombsDefusedCount: number;
  tilesClearedByBomb: number;
  iceUnfrozenCount: number;
  pointsGained: number;
  detonatedBombPositions: { row: number; col: number }[];
  defusedBombPositions: { row: number; col: number }[];
  explodedTilePositions: { row: number; col: number }[];
}

/**
 * Spawns a Special Tile (Bomb or Ice) on a random empty cell
 */
export const spawnSpecialTile = (
  board: BoardMatrix,
  specialType: SpecialTileType,
  size: number = board.length
): { board: BoardMatrix; newTile: Tile | null } => {
  const emptyCells = getEmptyCells(board, size);
  if (emptyCells.length === 0) {
    return { board, newTile: null };
  }

  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  const { row, col } = emptyCells[randomIndex];

  let newTile: Tile;
  if (specialType === 'BOMB') {
    newTile = {
      id: generateTileId(),
      value: 0, // Bomb tile has no numerical value
      row,
      col,
      specialType: 'BOMB',
      fuseTimer: 2, // 2 moves countdown fuse for bomb defusal
      isNew: true,
    };
  } else {
    // Ice tile covers a standard number (2 or 4)
    const baseValue = Math.random() < 0.8 ? 2 : 4;
    newTile = {
      id: generateTileId(),
      value: baseValue,
      row,
      col,
      specialType: 'ICE',
      isFrozen: true,
      iceHitCount: 0,
      isNew: true,
    };
  }

  const newBoard = cloneBoard(board);
  newBoard[row][col] = newTile;
  return { board: newBoard, newTile };
};

/**
 * Checks if cell (r2, c2) is adjacent to cell (r1, c1) including diagonals or orthogonal
 */
export const isAdjacent = (r1: number, c1: number, r2: number, c2: number): boolean => {
  const rowDiff = Math.abs(r1 - r2);
  const colDiff = Math.abs(c1 - c2);
  return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
};

/**
 * Processes special tile activations (Bomb defusal/blast and Ice unfreezing) after a move with merges
 */
export const processSpecialTilesAfterMove = (
  board: BoardMatrix,
  mergedCells: { row: number; col: number }[],
  size: number = board.length
): ProcessSpecialTilesResult => {
  let updatedBoard = cloneBoard(board);
  let bombsDetonatedCount = 0;
  let bombsDefusedCount = 0;
  let tilesClearedByBomb = 0;
  let iceUnfrozenCount = 0;
  let pointsGained = 0;
  const detonatedBombPositions: { row: number; col: number }[] = [];
  const defusedBombPositions: { row: number; col: number }[] = [];
  const explodedTilePositions: { row: number; col: number }[] = [];

  // 1. Process ICE unfreezing if any merges occurred
  if (mergedCells.length > 0) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const tile = updatedBoard[r]?.[c];
        if (tile && tile.specialType === 'ICE' && tile.isFrozen) {
          const hasAdjacentMerge = mergedCells.some((m) => isAdjacent(tile.row, tile.col, m.row, m.col));
          if (hasAdjacentMerge) {
            const newHitCount = (tile.iceHitCount || 0) + 1;
            if (newHitCount >= 3) {
              updatedBoard[r][c] = {
                ...tile,
                isFrozen: false,
                iceHitCount: 3,
                specialType: undefined, // Converts back to normal usable tile
              };
              iceUnfrozenCount += 1;
            } else {
              updatedBoard[r][c] = {
                ...tile,
                iceHitCount: newHitCount,
              };
            }
          }
        }
      }
    }
  }

  // 2. Process BOMB defusal (adjacent merge defuses bomb for +300 PTS) & fuse expiration (explodes for -200 PTS penalty)
  const bombsToDetonate: { row: number; col: number }[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const tile = updatedBoard[r]?.[c];
      if (tile && tile.specialType === 'BOMB') {
        const hasAdjacentMerge = mergedCells.some((m) => isAdjacent(tile.row, tile.col, m.row, m.col));

        if (hasAdjacentMerge) {
          // Player merged adjacent to bomb -> BOMB DEFUSED!
          bombsDefusedCount += 1;
          pointsGained += 300; // Bonus for defusing!
          defusedBombPositions.push({ row: tile.row, col: tile.col });
          updatedBoard[r][c] = null; // Safely disarms and clears bomb
        } else {
          // Decrement 2-move fuse timer for moves without defusal
          const currentFuse = (tile.fuseTimer !== undefined ? tile.fuseTimer : 2) - 1;

          if (currentFuse <= 0) {
            // Fuse expired (2 moves over without defusal) -> BOMB EXPLODES!
            bombsToDetonate.push({ row: tile.row, col: tile.col });
          } else {
            updatedBoard[r][c] = {
              ...tile,
              fuseTimer: currentFuse,
            };
          }
        }
      }
    }
  }

  // 3. Process detonating bombs (fuse expired on 2 moves) - PENALTY (-200 PTS) AND CLUTTER CLEARING
  if (bombsToDetonate.length > 0) {
    for (const bombPos of bombsToDetonate) {
      bombsDetonatedCount += 1;
      pointsGained -= 200; // Penalty for letting bomb explode!
      detonatedBombPositions.push(bombPos);

      // Clear surrounding clutter tiles (<= 16) in 3x3 radius, keeping high value tiles (>= 32) intact!
      for (let r = Math.max(0, bombPos.row - 1); r <= Math.min(size - 1, bombPos.row + 1); r++) {
        for (let c = Math.max(0, bombPos.col - 1); c <= Math.min(size - 1, bombPos.col + 1); c++) {
          const tileToClear = updatedBoard[r]?.[c];
          if (tileToClear !== null) {
            if (!tileToClear.value || tileToClear.value <= 16) {
              tilesClearedByBomb += 1;
              explodedTilePositions.push({ row: r, col: c });
              updatedBoard[r][c] = null;
            }
          }
        }
      }
    }
  }

  return {
    board: updatedBoard,
    bombsDetonatedCount,
    bombsDefusedCount,
    tilesClearedByBomb,
    iceUnfrozenCount,
    pointsGained,
    detonatedBombPositions,
    defusedBombPositions,
    explodedTilePositions,
  };
};

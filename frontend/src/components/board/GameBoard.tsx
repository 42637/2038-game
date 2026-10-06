import React, { useRef } from 'react';
import { Bomb, Snowflake, Flame } from 'lucide-react';
import { BoardMatrix, BoardSize, Direction, Tile as TileType } from '../../types/game';
import { useSwipe } from '../../hooks/useSwipe';
import './GameBoard.css';

interface GameBoardProps {
  board: BoardMatrix;
  boardSize?: BoardSize;
  onSwipe: (direction: Direction) => void;
  floatingScores?: { id: string; score: number; row: number; col: number }[];
  isHammerActive?: boolean;
  onHammerTile?: (row: number, col: number) => void;
  onToggleHammer?: () => void;
  explosions?: {
    bombPositions: { row: number; col: number }[];
    cellPositions: { row: number; col: number }[];
  } | null;
  disabled?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  boardSize = 4,
  onSwipe,
  floatingScores = [],
  isHammerActive = false,
  onHammerTile,
  onToggleHammer,
  explosions = null,
  disabled = false,
}) => {
  const boardRef = useRef<HTMLDivElement>(null);

  // Bind pointer & touch swipe gestures (disable swipe when hammer target mode is active)
  useSwipe(boardRef, { onSwipe, disabled: disabled || isHammerActive });

  const gridSize = boardSize;

  // Flatten active board matrix into tile list
  const tiles: TileType[] = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const tile = board[r]?.[c];
      if (tile) {
        tiles.push(tile);
      }
    }
  }

  // Calculate 3x3 blast target cells for active bombs
  const bombTargetCells = new Set<string>();
  tiles.forEach((tile) => {
    if (tile.specialType === 'BOMB') {
      for (let r = Math.max(0, tile.row - 1); r <= Math.min(gridSize - 1, tile.row + 1); r++) {
        for (let c = Math.max(0, tile.col - 1); c <= Math.min(gridSize - 1, tile.col + 1); c++) {
          bombTargetCells.add(`${r}_${c}`);
        }
      }
    }
  });

  const getTileColorClass = (tile: TileType): string => {
    if (tile.specialType === 'BOMB') {
      return 'tile-special-bomb';
    }
    if (tile.value <= 8192) {
      return `tile-val-${tile.value}`;
    }
    return 'tile-val-super';
  };

  const getFontSizeClass = (val: number): string => {
    if (gridSize === 6) {
      if (val < 100) return 'text-grid6-lg';
      if (val < 1000) return 'text-grid6-md';
      return 'text-grid6-sm';
    } else if (gridSize === 5) {
      if (val < 100) return 'text-grid5-lg';
      if (val < 1000) return 'text-grid5-md';
      return 'text-grid5-sm';
    } else {
      if (val < 100) return 'text-xl';
      if (val < 1000) return 'text-lg';
      if (val < 10000) return 'text-md';
      return 'text-sm';
    }
  };

  const gap = gridSize === 6 ? 6 : gridSize === 5 ? 8 : 10;
  const cellSizeCalc = `calc((100% - ${(gridSize - 1) * gap}px) / ${gridSize})`;

  return (
    <div className={`board-container-outer ${isHammerActive ? 'hammer-active-outer' : ''}`}>
      {/* Active Hammer Mode Prompt Banner */}
      {isHammerActive && (
        <div className="hammer-mode-banner">
          <div className="hammer-banner-content">
            <span className="hammer-banner-icon">🔨</span>
            <span className="hammer-banner-text">HAMMER ACTIVE: Tap any tile to smash it!</span>
          </div>
          <button
            type="button"
            className="hammer-cancel-btn"
            onClick={() => onToggleHammer && onToggleHammer()}
          >
            CANCEL
          </button>
        </div>
      )}

      <div className={`board-wrapper ${explosions ? 'board-wrapper-exploding' : ''} ${isHammerActive ? 'hammer-mode-active' : ''}`}>
        <div
          ref={boardRef}
          className={`game-board grid-size-${gridSize} ${disabled ? 'board-disabled' : ''} ${explosions ? 'board-shaking' : ''
            }`}
        >
        {/* N x N Background Cells with Bomb Blast Area Highlighting */}
        <div
          className="grid-background"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
            const r = Math.floor(idx / gridSize);
            const c = idx % gridSize;
            const isBombTarget = bombTargetCells.has(`${r}_${c}`);
            const hasTile = !!board[r]?.[c];
            return (
              <div
                key={`cell_${idx}`}
                className={`grid-cell ${isBombTarget ? 'cell-bomb-target' : ''} ${
                  isHammerActive && hasTile ? 'cell-hammer-targetable' : ''
                }`}
                onClick={(e) => {
                  if (isHammerActive && hasTile && onHammerTile) {
                    e.stopPropagation();
                    onHammerTile(r, c);
                  }
                }}
                onPointerDown={(e) => {
                  if (isHammerActive && hasTile && onHammerTile) {
                    e.stopPropagation();
                    onHammerTile(r, c);
                  }
                }}
              />
            );
          })}
        </div>

        {/* Dynamic Animated Tile Layer */}
        <div className={`tiles-container ${isHammerActive ? 'tiles-container-hammer-active' : ''}`}>
          {tiles.map((tile) => {
            const colorClass = getTileColorClass(tile);
            const fontSizeClass = getFontSizeClass(tile.value);
            const animClass = tile.isMerged ? 'tile-merged' : tile.isNew ? 'tile-spawn' : '';
            const iceClass = tile.isFrozen ? 'tile-frozen' : '';

            const wrapperStyle: React.CSSProperties = {
              width: cellSizeCalc,
              height: cellSizeCalc,
              transform: `translate3d(calc(${tile.col} * (100% + ${gap}px)), calc(${tile.row} * (100% + ${gap}px)), 0)`,
              pointerEvents: isHammerActive ? 'auto' : 'none',
              cursor: isHammerActive ? 'pointer' : 'default',
            };

            const handleTileSmash = (e: React.SyntheticEvent) => {
              if (isHammerActive && onHammerTile) {
                e.preventDefault();
                e.stopPropagation();
                onHammerTile(tile.row, tile.col);
              }
            };

            return (
              <div
                key={tile.id}
                className={`tile-wrapper ${isHammerActive ? 'hammer-targetable' : ''}`}
                style={wrapperStyle}
                onClick={handleTileSmash}
                onPointerDown={handleTileSmash}
                onTouchEnd={handleTileSmash}
              >
                <div className={`tile-inner ${colorClass} ${fontSizeClass} ${animClass} ${iceClass}`}>
                  {isHammerActive && (
                    <div className="hammer-target-overlay">
                      <span className="hammer-target-icon">🔨</span>
                    </div>
                  )}
                  {tile.specialType === 'BOMB' ? (
                    <div className="bomb-tile-content">
                      <Flame size={14} className="bomb-fuse-spark" />
                      <Bomb size={22} className="bomb-icon" />
                      <span className={`bomb-fuse-timer ${tile.fuseTimer === 1 ? 'fuse-danger' : ''}`}>
                        💥 {tile.fuseTimer !== undefined ? tile.fuseTimer : 3} MOVES
                      </span>
                    </div>
                  ) : (
                    <span>{tile.value}</span>
                  )}

                  {tile.isFrozen && (
                    <div className="ice-overlay-badge">
                      <Snowflake size={12} className="ice-badge-icon" />
                      <span>FROZEN ({tile.iceHitCount || 0}/3)</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Floating Score Popups Layer */}
          {floatingScores.map((fs) => {
            const fsStyle: React.CSSProperties = {
              width: cellSizeCalc,
              height: cellSizeCalc,
              transform: `translate3d(calc(${fs.col} * (100% + ${gap}px)), calc(${fs.row} * (100% + ${gap}px)), 0)`,
            };

            return (
              <div key={fs.id} className="floating-score-item" style={fsStyle}>
                +{fs.score}
              </div>
            );
          })}

          {/* Explosion Blast Waves & Fire Particle Layer */}
          {explosions &&
            explosions.cellPositions.map((pos, idx) => {
              const blastStyle: React.CSSProperties = {
                width: cellSizeCalc,
                height: cellSizeCalc,
                transform: `translate3d(calc(${pos.col} * (100% + ${gap}px)), calc(${pos.row} * (100% + ${gap}px)), 0)`,
              };

              const isCenterBomb = explosions.bombPositions.some(
                (bp) => bp.row === pos.row && bp.col === pos.col
              );

              return (
                <div
                  key={`blast_${pos.row}_${pos.col}_${idx}`}
                  className={`explosion-blast-cell ${isCenterBomb ? 'blast-center-bomb' : ''}`}
                  style={blastStyle}
                >
                  <div className="blast-ring" />
                  <div className="blast-flash" />
                  <div className="blast-particles">
                    <span className="p1">💥</span>
                    <span className="p2">🔥</span>
                    <span className="p3">⚡</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  </div>
);
};

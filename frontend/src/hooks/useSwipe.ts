import { useEffect, useRef } from 'react';
import { Direction } from '../types/game';

interface UseSwipeOptions {
  onSwipe: (direction: Direction) => void;
  disabled?: boolean;
  minDistance?: number;
}

export const useSwipe = (
  containerRef: React.RefObject<HTMLElement | null>,
  { onSwipe, disabled = false, minDistance = 15 }: UseSwipeOptions
) => {
  const onSwipeRef = useRef(onSwipe);
  onSwipeRef.current = onSwipe;

  const startCoordsRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || disabled) return;

    const handleStart = (clientX: number, clientY: number) => {
      startCoordsRef.current = { x: clientX, y: clientY };
      isDraggingRef.current = true;
    };

    const handleMove = (clientX: number, clientY: number, e?: Event) => {
      if (!isDraggingRef.current || !startCoordsRef.current) return;
      if (e && e.cancelable) {
        e.preventDefault();
      }
    };

    const handleEnd = (clientX: number, clientY: number) => {
      if (!isDraggingRef.current || !startCoordsRef.current) return;
      const deltaX = clientX - startCoordsRef.current.x;
      const deltaY = clientY - startCoordsRef.current.y;
      startCoordsRef.current = null;
      isDraggingRef.current = false;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (Math.max(absX, absY) < minDistance) {
        return; // Ignore tiny movements
      }

      if (absX > absY) {
        if (deltaX > 0) {
          onSwipeRef.current('RIGHT');
        } else {
          onSwipeRef.current('LEFT');
        }
      } else {
        if (deltaY > 0) {
          onSwipeRef.current('DOWN');
        } else {
          onSwipeRef.current('UP');
        }
      }
    };

    // Pointer Events (Unified Mouse + Touch + Stylus)
    const onPointerDown = (e: PointerEvent) => {
      // Only main button for mouse
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      handleStart(e.clientX, e.clientY);
    };

    const onPointerMove = (e: PointerEvent) => {
      handleMove(e.clientX, e.clientY, e);
    };

    const onPointerUp = (e: PointerEvent) => {
      handleEnd(e.clientX, e.clientY);
    };

    const onPointerCancel = () => {
      startCoordsRef.current = null;
      isDraggingRef.current = false;
    };

    // Touch Events Fallback
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY, e);
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 0) return;
      const touch = e.changedTouches[0];
      handleEnd(touch.clientX, touch.clientY);
    };

    // Keyboard controls
    const onKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          onSwipeRef.current('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          onSwipeRef.current('RIGHT');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          onSwipeRef.current('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          onSwipeRef.current('DOWN');
          break;
      }
    };

    // Attach Pointer events
    if (window.PointerEvent) {
      el.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerCancel);
    } else {
      // Touch fallback
      el.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      if (window.PointerEvent) {
        el.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerCancel);
      } else {
        el.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
      }
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [containerRef, disabled, minDistance]);
};

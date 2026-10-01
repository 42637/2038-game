export const triggerHaptic = (pattern: number | number[], enabled = true): void => {
  if (!enabled) return;
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Haptics not supported or permitted on current device
    }
  }
};

export const hapticPatterns = {
  move: 10,
  smallMerge: 25,
  largeMerge: [30, 20, 40],
  milestone: [40, 30, 60, 30, 80],
  challengeComplete: [60, 40, 80, 40, 120],
  challengeFailed: [120, 50, 120],
  newBest: [50, 40, 50, 40, 100],
  gameOver: [100, 50, 100],
  bomb: [80, 30, 80],
  iceBreak: [35, 25, 45],
  streakMilestone: [50, 40, 70, 40, 100],
};

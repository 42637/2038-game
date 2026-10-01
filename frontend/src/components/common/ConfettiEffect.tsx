import React, { useEffect, useRef } from 'react';
import './ConfettiEffect.css';

interface ConfettiEffectProps {
  durationMs?: number;
  onFinish?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const PALETTE = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#FBBF24'];

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ durationMs = 2500, onFinish }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const particles: Particle[] = Array.from({ length: 90 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.4) - 20,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 5 + 3,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      size: Math.random() * 8 + 6,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    }));

    const startTime = Date.now();

    const render = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.vy += 0.08; // gravity

        if (elapsed > durationMs - 600) {
          p.opacity = Math.max(0, p.opacity - 0.03);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      });

      if (elapsed < durationMs) {
        animFrameId = requestAnimationFrame(render);
      } else {
        if (onFinish) onFinish();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [durationMs, onFinish]);

  return <canvas ref={canvasRef} className="confetti-canvas" />;
};

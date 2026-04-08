/**
 * Active layer — the topmost canvas that captures all mouse events.
 *
 * Renders:
 * - Draw tool previews (pen path, line, rectangle)
 * - Laser line preview while drawing
 * - Local laser dot
 * - Peer cursors (colored dots, laser dots with glow)
 * - Fading laser lines (local + peer, 3-second fade animation)
 */

import { useRef, useEffect } from 'react';
import { Tool } from '@nd-battleplanner/shared';
import { useCanvasStore } from '@/stores/canvas.store';
import type { DrawPreview } from '../tools/useDrawTool';
import type { CursorData, LaserLineData } from '../types';

interface ActiveLayerProps {
  width: number;
  height: number;
  cursor: string;
  drawPreview: DrawPreview | null;
  localLaserPos: { x: number; y: number } | null;
  laserFadeLines: LaserLineData[];
  laserPreviewPath: Array<{ x: number; y: number }>;
  peerLaserLines?: LaserLineData[];
  cursors?: Map<string, CursorData>;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

export function ActiveLayer({
  width, height, cursor,
  drawPreview, localLaserPos, laserFadeLines, laserPreviewPath,
  peerLaserLines, cursors,
  onMouseDown, onMouseMove, onMouseUp, onMouseLeave,
}: ActiveLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync canvas dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }, [width, height]);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const tool = useCanvasStore.getState().tool;

    // 1. Draw tool preview
    if (drawPreview) {
      paintDrawPreview(ctx, drawPreview);
    }

    // 2. Laser line preview (while drawing)
    if (laserPreviewPath.length > 1 && tool === Tool.LaserLine) {
      const color = useCanvasStore.getState().color;
      paintGlowingPath(ctx, laserPreviewPath, color, 1);
    }

    // 3. Local laser dot
    if (localLaserPos && tool === Tool.LaserDot) {
      const color = useCanvasStore.getState().color;
      paintLaserDot(ctx, localLaserPos.x, localLaserPos.y, color);
    }

    // 4. Peer cursors
    if (cursors) {
      for (const [, c] of cursors) {
        if (c.isLaser) {
          paintLaserDot(ctx, c.x, c.y, c.color);
        } else {
          paintCursorDot(ctx, c.x, c.y, c.color);
        }
      }
    }

    // 5. Fading laser lines (local)
    const now = Date.now();
    for (const line of laserFadeLines) {
      const elapsed = now - (line.fadeStart ?? 0);
      const alpha = Math.max(0, 1 - elapsed / 3000);
      if (alpha > 0 && line.points.length > 1) {
        paintGlowingPath(ctx, line.points, line.color, alpha);
      }
    }

    // 6. Fading peer laser lines
    if (peerLaserLines) {
      for (const line of peerLaserLines) {
        const fadeStart = line.fadeStart ?? now;
        const elapsed = now - fadeStart;
        const alpha = line.fadeStart ? Math.max(0, 1 - elapsed / 3000) : 1;
        if (alpha > 0 && line.points.length > 1) {
          paintGlowingPath(ctx, line.points, line.color, alpha);
        }
      }
    }
  }, [drawPreview, localLaserPos, laserFadeLines, laserPreviewPath, peerLaserLines, cursors, width, height]);

  // Animation loop for fading laser lines
  useEffect(() => {
    const hasFading = laserFadeLines.length > 0 || peerLaserLines?.some(l => l.fadeStart);
    if (!hasFading) return;

    let frameId: number;
    const tick = () => { frameId = requestAnimationFrame(tick); };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [laserFadeLines.length, peerLaserLines]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, cursor }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    />
  );
}

// --- Painting helpers ---

function paintDrawPreview(ctx: CanvasRenderingContext2D, p: DrawPreview) {
  ctx.save();
  ctx.strokeStyle = p.color;
  ctx.lineWidth = p.lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (p.type === 'pen' && p.path && p.path.length > 1) {
    ctx.beginPath();
    ctx.moveTo(p.path[0]!.x, p.path[0]!.y);
    for (let i = 1; i < p.path.length; i++) {
      ctx.lineTo(p.path[i]!.x, p.path[i]!.y);
    }
    ctx.stroke();
  } else if (p.type === 'line' && p.start && p.end) {
    ctx.beginPath();
    ctx.moveTo(p.start.x, p.start.y);
    ctx.lineTo(p.end.x, p.end.y);
    ctx.stroke();
  } else if (p.type === 'rectangle' && p.start && p.end) {
    ctx.strokeRect(
      p.start.x, p.start.y,
      p.end.x - p.start.x, p.end.y - p.start.y,
    );
  }

  ctx.restore();
}

function paintGlowingPath(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
  color: string,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;

  ctx.beginPath();
  ctx.moveTo(points[0]!.x, points[0]!.y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i]!.x, points[i]!.y);
  }
  ctx.stroke();
  ctx.restore();
}

function paintLaserDot(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function paintCursorDot(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

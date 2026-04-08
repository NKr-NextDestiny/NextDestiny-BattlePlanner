/**
 * Laser tool hook — handles both LaserDot and LaserLine tools.
 *
 * LaserDot: tracks cursor position and emits it to peers.
 * LaserLine: collects points while dragging, broadcasts them
 *            throttled (~50ms), then adds a fading line on release.
 *
 * Neither tool persists to the database — purely ephemeral.
 */

import { useState, useRef } from 'react';
import { Tool } from '@nd-battleplanner/shared';
import { useCanvasStore } from '@/stores/canvas.store';
import { screenToCanvas } from '../rendering/viewport';
import type { LaserLineData } from '../types';

interface UseLaserToolOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onLaserLine?: (points: Array<{ x: number; y: number }>, color: string) => void;
  onCursorMove?: (x: number, y: number, isLaser: boolean) => void;
}

export function useLaserTool({ containerRef, onLaserLine, onCursorMove }: UseLaserToolOptions) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [localLaserPos, setLocalLaserPos] = useState<{ x: number; y: number } | null>(null);
  const [laserFadeLines, setLaserFadeLines] = useState<LaserLineData[]>([]);
  const [laserPreviewPath, setLaserPreviewPath] = useState<Array<{ x: number; y: number }>>([]);

  const pointsRef = useRef<Array<{ x: number; y: number }>>([]);
  const throttleRef = useRef(0);

  function toCanvas(e: React.MouseEvent) {
    const rect = containerRef.current!.getBoundingClientRect();
    const { offsetX, offsetY, scale } = useCanvasStore.getState();
    return screenToCanvas(e.clientX, e.clientY, rect, offsetX, offsetY, scale);
  }

  function onMouseDown(e: React.MouseEvent): boolean {
    const { tool } = useCanvasStore.getState();

    // LaserDot has no drag action
    if (tool === Tool.LaserDot) return true;
    if (tool !== Tool.LaserLine) return false;

    const pos = toCanvas(e);
    pointsRef.current = [pos];
    setIsDrawing(true);
    setLaserPreviewPath([pos]);
    return true;
  }

  function onMouseMove(e: React.MouseEvent): boolean {
    const { tool, color } = useCanvasStore.getState();
    const pos = toCanvas(e);

    // Broadcast cursor position
    onCursorMove?.(pos.x, pos.y, tool === Tool.LaserDot);

    if (tool === Tool.LaserDot) {
      setLocalLaserPos(pos);
      return true;
    }

    // Clear laser dot position when switching away
    if (localLaserPos) setLocalLaserPos(null);

    if (tool !== Tool.LaserLine || !isDrawing) return false;

    pointsRef.current.push(pos);

    // Throttle broadcast (~50ms interval)
    const now = Date.now();
    if (now - throttleRef.current > 50) {
      throttleRef.current = now;
      onLaserLine?.(pointsRef.current, color);
    }

    setLaserPreviewPath([...pointsRef.current]);
    return true;
  }

  function onMouseUp(e: React.MouseEvent): boolean {
    const { tool, color } = useCanvasStore.getState();
    if (tool !== Tool.LaserLine || !isDrawing) return false;

    const pos = toCanvas(e);
    const finalPoints = [...pointsRef.current, pos];

    // Final broadcast
    onLaserLine?.(finalPoints, color);

    // Add to local fade lines
    if (finalPoints.length > 1) {
      setLaserFadeLines(prev => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          userId: 'local',
          points: finalPoints,
          color,
          fadeStart: Date.now(),
        },
      ]);
    }

    pointsRef.current = [];
    setIsDrawing(false);
    setLaserPreviewPath([]);
    return true;
  }

  function cleanupFadeLines() {
    const now = Date.now();
    setLaserFadeLines(prev => prev.filter(l => now - (l.fadeStart ?? 0) < 3000));
  }

  function reset() {
    setIsDrawing(false);
    setLocalLaserPos(null);
    setLaserPreviewPath([]);
    pointsRef.current = [];
  }

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    localLaserPos,
    laserFadeLines,
    laserPreviewPath,
    isDrawingLaser: isDrawing,
    cleanupFadeLines,
    reset,
  };
}

/**
 * Drawing tool hook for Pen, Line, and Rectangle tools.
 *
 * Collects mouse events while drawing and produces a preview
 * for the active layer to render. On mouse up, creates the final
 * draw via onDrawCreate callback.
 *
 * Line and Rectangle auto-switch to Select tool after completion.
 */

import { useState, useRef } from 'react';
import { Tool } from '@nd-battleplanner/shared';
import { useCanvasStore } from '@/stores/canvas.store';
import { screenToCanvas } from '../rendering/viewport';

export interface DrawPreview {
  type: 'pen' | 'line' | 'rectangle';
  color: string;
  lineWidth: number;
  path?: Array<{ x: number; y: number }>;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

interface UseDrawToolOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  floorId: string;
  onDrawCreate?: (floorId: string, draws: any[]) => void;
}

export function useDrawTool({ containerRef, floorId, onDrawCreate }: UseDrawToolOptions) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [preview, setPreview] = useState<DrawPreview | null>(null);
  const pointsRef = useRef<Array<{ x: number; y: number }>>([]);
  const originRef = useRef<{ x: number; y: number } | null>(null);

  function toCanvas(e: React.MouseEvent) {
    const rect = containerRef.current!.getBoundingClientRect();
    const { offsetX, offsetY, scale } = useCanvasStore.getState();
    return screenToCanvas(e.clientX, e.clientY, rect, offsetX, offsetY, scale);
  }

  function onMouseDown(e: React.MouseEvent): boolean {
    const { tool, color, lineWidth } = useCanvasStore.getState();

    if (tool !== Tool.Pen && tool !== Tool.Line && tool !== Tool.Rectangle) return false;

    const pos = toCanvas(e);
    originRef.current = pos;
    setIsDrawing(true);

    if (tool === Tool.Pen) {
      pointsRef.current = [pos];
      setPreview({ type: 'pen', color, lineWidth, path: [pos] });
    }

    return true;
  }

  function onMouseMove(e: React.MouseEvent): boolean {
    if (!isDrawing || !originRef.current) return false;

    const { tool, color, lineWidth } = useCanvasStore.getState();
    if (tool !== Tool.Pen && tool !== Tool.Line && tool !== Tool.Rectangle) return false;

    const pos = toCanvas(e);

    if (tool === Tool.Pen) {
      pointsRef.current.push(pos);
      setPreview({ type: 'pen', color, lineWidth, path: [...pointsRef.current] });
    } else if (tool === Tool.Line) {
      setPreview({ type: 'line', color, lineWidth, start: originRef.current, end: pos });
    } else {
      setPreview({ type: 'rectangle', color, lineWidth, start: originRef.current, end: pos });
    }

    return true;
  }

  function onMouseUp(e: React.MouseEvent): boolean {
    if (!isDrawing || !originRef.current) return false;

    const { tool, color, lineWidth } = useCanvasStore.getState();
    if (tool !== Tool.Pen && tool !== Tool.Line && tool !== Tool.Rectangle) return false;

    const pos = toCanvas(e);
    setIsDrawing(false);
    setPreview(null);

    let draw: any = null;

    if (tool === Tool.Pen) {
      pointsRef.current.push(pos);
      if (pointsRef.current.length > 1) {
        draw = {
          type: 'path',
          originX: pointsRef.current[0]!.x,
          originY: pointsRef.current[0]!.y,
          data: { points: pointsRef.current, color, lineWidth },
        };
      }
    } else if (tool === Tool.Line) {
      const start = originRef.current;
      draw = {
        type: 'line',
        originX: start.x,
        originY: start.y,
        destinationX: pos.x,
        destinationY: pos.y,
        data: { color, lineWidth },
      };
    } else {
      const start = originRef.current;
      draw = {
        type: 'rectangle',
        originX: start.x,
        originY: start.y,
        destinationX: pos.x,
        destinationY: pos.y,
        data: {
          width: pos.x - start.x,
          height: pos.y - start.y,
          color,
          lineWidth,
          filled: false,
        },
      };
    }

    if (draw && onDrawCreate) {
      onDrawCreate(floorId, [draw]);

      // Auto-switch to Select after Line/Rectangle
      if (tool === Tool.Line || tool === Tool.Rectangle) {
        useCanvasStore.getState().setTool(Tool.Select);
      }
    }

    pointsRef.current = [];
    originRef.current = null;
    return true;
  }

  function reset() {
    setIsDrawing(false);
    setPreview(null);
    pointsRef.current = [];
    originRef.current = null;
  }

  return { onMouseDown, onMouseMove, onMouseUp, preview, isDrawing, reset };
}

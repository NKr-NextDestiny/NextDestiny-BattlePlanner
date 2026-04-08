/**
 * Draw layer — renders all committed draws onto a canvas.
 *
 * Handles:
 * - Phase filtering (only show draws from active phase)
 * - Operator visibility (hide draws from hidden operator slots)
 * - Landscape visibility (hide non-operator draws when landscape is off)
 * - Ownership dimming (others' draws at 60% opacity)
 * - Selection overlay on the selected draw
 * - Hiding the draw being dragged (shown as preview on active layer)
 */

import { useRef, useEffect, useCallback } from 'react';
import { renderDraw } from '../rendering/renderDraw';
import { renderSelectionOverlay } from '../rendering/selection';

interface DrawLayerProps {
  width: number;
  height: number;
  draws: any[];
  currentUserId?: string | null;
  selectedDrawId?: string | null;
  draggedDrawId?: string | null;
  activePhaseId?: string | null;
  visibleSlotIds?: Set<string> | null;
  landscapeVisible?: boolean;
}

export function DrawLayer({
  width, height, draws,
  currentUserId, selectedDrawId, draggedDrawId,
  activePhaseId, visibleSlotIds, landscapeVisible = true,
}: DrawLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Ref-based re-render trigger for async icon loads
  const repaintRef = useRef<() => void>(() => {});

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const draw of draws) {
      if (draw.isDeleted) continue;

      // Skip the draw currently being dragged (preview is on active layer)
      if (draggedDrawId && draw.id === draggedDrawId) continue;

      // Phase filter
      if (activePhaseId && draw.phaseId && draw.phaseId !== activePhaseId) continue;

      // Operator visibility filter
      if (draw.operatorSlotId) {
        if (visibleSlotIds && !visibleSlotIds.has(draw.operatorSlotId)) continue;
      } else if (!landscapeVisible) {
        continue;
      }

      ctx.save();

      // Dim other users' draws
      if (currentUserId && draw.userId && draw.userId !== currentUserId) {
        ctx.globalAlpha = 0.6;
      }

      renderDraw(ctx, draw, repaintRef);
      ctx.restore();

      // Render selection overlay on the selected draw
      if (draw.id === selectedDrawId) {
        renderSelectionOverlay(ctx, draw);
      }
    }
  }, [draws, currentUserId, selectedDrawId, draggedDrawId, activePhaseId, visibleSlotIds, landscapeVisible]);

  // Keep the repaint ref updated
  repaintRef.current = paint;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    paint();
  }, [width, height, paint]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0 }}
    />
  );
}

/**
 * Tool router — master hook that composes all individual tool hooks
 * and dispatches mouse events to the active tool.
 *
 * Priority rules:
 * 1. Pan (middle-click) always takes priority
 * 2. Laser tools work even in readOnly mode (cursor broadcasting)
 * 3. All other tools are blocked in readOnly mode
 * 4. Cursor position is always emitted for non-laser tools too
 */

import { useCallback } from 'react';
import { Tool } from '@nd-battleplanner/shared';
import { useCanvasStore } from '@/stores/canvas.store';
import { screenToCanvas } from '../rendering/viewport';
import { useDrawTool } from './useDrawTool';
import { useTextTool } from './useTextTool';
import { useIconTool } from './useIconTool';
import { useEraserTool } from './useEraserTool';
import { useSelectTool } from './useSelectTool';
import { usePanTool } from './usePanTool';
import { useLaserTool } from './useLaserTool';
import { HANDLE_CURSORS, type HandleId } from '../rendering/selection';

interface UseToolRouterOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  floorId: string;
  allDraws: any[];
  readOnly: boolean;
  currentUserId: string | null;
  activePhaseId?: string | null;
  visibleSlotIds?: Set<string> | null;
  landscapeVisible?: boolean;
  onDrawCreate?: (floorId: string, draws: any[]) => void;
  onDrawDelete?: (drawIds: string[]) => void;
  onDrawUpdate?: (drawId: string, updates: any) => void;
  onLaserLine?: (points: Array<{ x: number; y: number }>, color: string) => void;
  onCursorMove?: (x: number, y: number, isLaser: boolean) => void;
  activeCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function useToolRouter(opts: UseToolRouterOptions) {
  const { containerRef, readOnly, activeCanvasRef } = opts;

  // Initialize all tool hooks
  const draw = useDrawTool({ containerRef, floorId: opts.floorId, onDrawCreate: opts.onDrawCreate });
  const text = useTextTool({ containerRef, floorId: opts.floorId, onDrawCreate: opts.onDrawCreate });
  const icon = useIconTool({ containerRef, floorId: opts.floorId, onDrawCreate: opts.onDrawCreate });
  const eraser = useEraserTool({
    containerRef, allDraws: opts.allDraws, currentUserId: opts.currentUserId,
    activePhaseId: opts.activePhaseId, visibleSlotIds: opts.visibleSlotIds,
    landscapeVisible: opts.landscapeVisible, onDrawDelete: opts.onDrawDelete,
  });
  const select = useSelectTool({
    containerRef, floorId: opts.floorId, allDraws: opts.allDraws,
    currentUserId: opts.currentUserId, activePhaseId: opts.activePhaseId,
    visibleSlotIds: opts.visibleSlotIds, landscapeVisible: opts.landscapeVisible,
    onDrawUpdate: opts.onDrawUpdate,
  });
  const pan = usePanTool({ containerRef });
  const laser = useLaserTool({
    containerRef, onLaserLine: opts.onLaserLine, onCursorMove: opts.onCursorMove,
  });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    // Pan always takes priority (middle-click or Pan tool)
    if (pan.onMouseDown(e)) return;
    if (readOnly) return;

    const { tool } = useCanvasStore.getState();
    switch (tool) {
      case Tool.Pen:
      case Tool.Line:
      case Tool.Arrow:
      case Tool.Rectangle:
      case Tool.Ellipse:
        draw.onMouseDown(e);
        break;
      case Tool.Text:
        text.onMouseDown(e);
        break;
      case Tool.Icon:
        icon.onMouseDown(e);
        break;
      case Tool.Eraser:
        eraser.onMouseDown(e);
        break;
      case Tool.Select:
        select.onMouseDown(e);
        break;
      case Tool.LaserDot:
      case Tool.LaserLine:
        laser.onMouseDown(e);
        break;
    }
  }, [readOnly, draw, text, icon, eraser, select, pan, laser]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    // Pan always takes priority
    if (pan.onMouseMove(e)) return;

    // Laser tools work even in readOnly (cursor broadcasting)
    const { tool } = useCanvasStore.getState();
    if (tool === Tool.LaserDot || tool === Tool.LaserLine) {
      laser.onMouseMove(e);
      return;
    }

    if (readOnly) return;

    // Select tool needs the active canvas context for drag previews
    if (tool === Tool.Select && select.isDragging) {
      const ctx = activeCanvasRef.current?.getContext('2d') ?? null;
      select.onMouseMove(e, ctx);
      return;
    }

    // Drawing tools
    if (tool === Tool.Pen || tool === Tool.Line || tool === Tool.Arrow || tool === Tool.Rectangle || tool === Tool.Ellipse) {
      draw.onMouseMove(e);
    }

    // Emit cursor position for non-laser tools
    if (opts.onCursorMove && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const { offsetX, offsetY, scale } = useCanvasStore.getState();
      const pos = screenToCanvas(e.clientX, e.clientY, rect, offsetX, offsetY, scale);
      opts.onCursorMove(pos.x, pos.y, false);
    }
  }, [readOnly, draw, select, pan, laser, activeCanvasRef, containerRef, opts]);

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    if (pan.onMouseUp()) return;
    if (readOnly) return;

    const { tool } = useCanvasStore.getState();
    switch (tool) {
      case Tool.Pen:
      case Tool.Line:
      case Tool.Arrow:
      case Tool.Rectangle:
      case Tool.Ellipse:
        draw.onMouseUp(e);
        break;
      case Tool.Select:
        select.onMouseUp(e);
        break;
      case Tool.LaserLine:
        laser.onMouseUp(e);
        break;
    }
  }, [readOnly, draw, select, pan, laser]);

  const onMouseLeave = useCallback(() => {
    pan.reset();
    draw.reset();
    select.reset();
    laser.reset();
  }, [pan, draw, select, laser]);

  function getCursor(): string {
    if (readOnly) return 'default';
    if (pan.isPanning) return 'grabbing';

    const { tool, interactionMode, activeResizeHandle } = useCanvasStore.getState();
    if (tool === Tool.Pan) return 'grab';

    if (tool === Tool.Select) {
      if (select.isDragging) {
        if (interactionMode === 'rotate') return 'alias';
        if (interactionMode === 'resize' && activeResizeHandle) {
          return HANDLE_CURSORS[activeResizeHandle as HandleId] ?? 'default';
        }
        return 'grabbing';
      }
      return 'default';
    }

    if (tool === Tool.Eraser) return 'pointer';
    if (tool === Tool.LaserDot || tool === Tool.LaserLine) return 'crosshair';
    return 'crosshair';
  }

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    getCursor,
    drawPreview: draw.preview,
    draggedDrawId: select.draggedDrawId,
    localLaserPos: laser.localLaserPos,
    laserFadeLines: laser.laserFadeLines,
    laserPreviewPath: laser.laserPreviewPath,
    cleanupFadeLines: laser.cleanupFadeLines,
  };
}
